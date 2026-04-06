"""
CV vs Job Description comparison Celery task per D-C1, COMPARE-03, COMPARE-04.
Mirrors llm_suggest.py structure exactly — same ProgressTask base, Redis singleton,
asyncio.run() pattern, and exception handler.

Flow per D-C1:
1. Check Redis cache (comparison:{job_id}:{jd_hash[:16]}) — return if hit
2. Set job.comparison_status = "comparing" + emit comparing_job SSE stage
3. Get CV text from jobs.result["text"]
4. Call OpenAILLMService.compare_cv() with 3x retry inside service
5. Cache in Redis (TTL 24h per D-C7) + save to jobs table + emit complete
On failure (D-C8): set comparison_status = "failed", emit complete (not page-level failure)
"""

import asyncio
import hashlib
import json

import redis as redis_lib
from celery import Task
from sqlalchemy import select

from app.core.logging import mask_pii
from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus  # noqa: F401
from app.schemas.analysis import ComparisonResult
from app.services.llm.openai_service import OpenAILLMService
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask


# Module-level singleton — avoids re-instantiation per Celery task call
_llm_service = OpenAILLMService()

# Module-level Redis client — lazy init (same pattern as llm_suggest.py)
_redis_client: redis_lib.Redis | None = None


def _get_redis_client() -> redis_lib.Redis:
    """Lazy-init Redis client using Celery broker URL (same Redis as SSE pub/sub)."""
    global _redis_client  # noqa: PLW0603
    if _redis_client is None:
        _redis_client = redis_lib.from_url(celery_app.conf.broker_url)
    return _redis_client


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=1,  # LLM retries handled inside OpenAILLMService (3x)
    default_retry_delay=30,
)
def compare_cv_task(  # noqa: PLR0915
    self: Task,
    job_id: str,
    jd_text: str,
    jd_role_id: str | None = None,
) -> dict:
    """
    Compare CV against a job description via gpt-4o-mini JSON mode per D-C6.

    Emits 'comparing_job' SSE stage, saves result to jobs.comparison_result JSONB.
    Redis cache key: comparison:{job_id}:{sha256(jd_text)[:16]}, TTL 24h per D-C7.
    On failure (D-C8): sets comparison_status='failed', emits complete — NOT page-level error.
    """
    cache_key = (
        f"comparison:{job_id}:{hashlib.sha256(jd_text.encode()).hexdigest()[:16]}"
    )
    cache_ttl = 86400  # 24h per D-C7

    async def _get_cv_text() -> str | None:
        """Returns cv_text from jobs.result JSONB."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job and job.result:
                return job.result.get("text")
            return None

    async def _set_comparing_status() -> None:
        """Set job.comparison_status = 'comparing' so frontend shows comparing state."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.comparison_status = "comparing"
                await session.commit()

    async def _save_comparison(
        comparison_json: dict | None,
        status: str,
        jd_text_val: str,
        role_id: str | None,
    ) -> None:
        """Save comparison result + metadata to DB."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.comparison_result = comparison_json
                job.comparison_status = status
                job.jd_text = jd_text_val
                job.jd_role_id = role_id
                await session.commit()

    # ─── Redis cache check (D-C7) ────────────────────────────────────────────
    redis_client = _get_redis_client()
    cached = redis_client.get(cache_key)
    if cached:
        logger.info("Comparison cache hit", extra={"job_id": job_id})
        asyncio.run(
            _save_comparison(json.loads(cached), "complete", jd_text, jd_role_id)
        )
        self.update_progress(job_id, "complete", 100, "Comparison complete!")
        return {"status": "complete", "job_id": job_id, "from_cache": True}

    try:
        # ─── Set comparing status + emit SSE stage ────────────────────────────
        asyncio.run(_set_comparing_status())
        self.update_progress(
            job_id,
            "comparing_job",
            50,
            "Comparing your CV against the job description...",
        )

        # ─── Get CV text from DB ──────────────────────────────────────────────
        cv_text = asyncio.run(_get_cv_text())
        if not cv_text:
            logger.warning("compare_cv_task: missing CV text", extra={"job_id": job_id})
            asyncio.run(_save_comparison(None, "failed", jd_text, jd_role_id))
            self.update_progress(job_id, "complete", 100, "Comparison unavailable")
            return {"status": "failed", "job_id": job_id, "reason": "no_text"}

        # ─── LLM comparison call (3x retry inside service) ───────────────────
        result = _llm_service.compare_cv(cv_text=cv_text, jd_text=jd_text)

        # ─── Validate JSON output with ComparisonResult schema ────────────────
        validated = ComparisonResult(**result["comparison"])
        comparison_dict = validated.model_dump()

        # ─── Cache in Redis (D-C7: TTL 24h) ──────────────────────────────────
        redis_client.setex(cache_key, cache_ttl, json.dumps(comparison_dict))

        # ─── Save to DB + emit complete ───────────────────────────────────────
        asyncio.run(_save_comparison(comparison_dict, "complete", jd_text, jd_role_id))
        self.update_progress(job_id, "complete", 100, "Comparison complete!")

        logger.info(
            "CV comparison complete",
            extra={"job_id": job_id, "match_pct": validated.match_pct},
        )
        return {
            "status": "complete",
            "job_id": job_id,
            "match_pct": validated.match_pct,
        }

    except Exception as e:
        # D-C8: on final failure set comparison_status=failed
        # NEVER set job.status = FAILED — comparison failure doesn't invalidate analysis
        logger.error(
            mask_pii(f"compare_cv_task failed: {e}"),
            extra={"job_id": job_id, "stage": "comparing"},
        )
        asyncio.run(_save_comparison(None, "failed", jd_text, jd_role_id))
        self.update_progress(job_id, "complete", 100, "Comparison unavailable")
        return {"status": "failed", "job_id": job_id, "error": str(e)}

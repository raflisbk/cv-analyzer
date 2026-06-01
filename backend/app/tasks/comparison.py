import asyncio
import hashlib
import json

import redis as redis_lib
from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus  # noqa: F401
from app.schemas.analysis import ComparisonResult
from app.services.llm.koboi_llm_service import KoboiLLMService
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask

_llm_service = KoboiLLMService()
_redis_client: redis_lib.Redis | None = None


def _get_redis_client() -> redis_lib.Redis:
    global _redis_client  # noqa: PLW0603
    if _redis_client is None:
        _redis_client = redis_lib.from_url(celery_app.conf.broker_url)
    return _redis_client


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=1,
    default_retry_delay=30,
)
def compare_cv_task(
    self: Task,
    job_id: str,
    jd_text: str,
    jd_role_id: str | None = None,
) -> dict:
    cache_key = (
        f"comparison:{job_id}:{hashlib.sha256(jd_text.encode()).hexdigest()[:16]}"
    )
    cache_ttl = 86400

    async def _get_cv_text() -> str | None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job and job.result:
                return job.result.get("text")
            return None

    async def _set_comparing_status() -> None:
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

    redis_client = _get_redis_client()
    cached = redis_client.get(cache_key)
    if cached:
        logger.info("comparison_cache_hit", job_id=job_id)
        asyncio.run(
            _save_comparison(json.loads(cached), "complete", jd_text, jd_role_id)
        )
        self.update_progress(job_id, "complete", 100, "Comparison complete!")
        return {"status": "complete", "job_id": job_id, "from_cache": True}

    try:
        asyncio.run(_set_comparing_status())
        self.update_progress(
            job_id,
            "comparing_job",
            50,
            "Comparing your CV against the job description...",
        )
        cv_text = asyncio.run(_get_cv_text())
        if not cv_text:
            logger.warning("comparison_no_text", job_id=job_id)
            asyncio.run(_save_comparison(None, "failed", jd_text, jd_role_id))
            self.update_progress(job_id, "complete", 100, "Comparison unavailable")
            return {"status": "failed", "job_id": job_id, "reason": "no_text"}

        result = _llm_service.compare_cv(cv_text=cv_text, jd_text=jd_text)

        validated = ComparisonResult(**result["comparison"])
        comparison_dict = validated.model_dump()

        redis_client.setex(cache_key, cache_ttl, json.dumps(comparison_dict))

        asyncio.run(_save_comparison(comparison_dict, "complete", jd_text, jd_role_id))
        self.update_progress(job_id, "complete", 100, "Comparison complete!")

        logger.info(
            "comparison_done",
            job_id=job_id,
            match_pct=validated.match_pct,
        )
        return {
            "status": "complete",
            "job_id": job_id,
            "match_pct": validated.match_pct,
        }

    except Exception as e:
        logger.error(
            "comparison_failed",
            job_id=job_id,
            error=str(e),
            stage="comparing",
            exc_info=True,
        )
        asyncio.run(_save_comparison(None, "failed", jd_text, jd_role_id))
        self.update_progress(job_id, "complete", 100, "Comparison unavailable")
        return {"status": "failed", "job_id": job_id, "error": str(e)}

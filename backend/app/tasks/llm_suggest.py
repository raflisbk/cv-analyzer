"""
LLM suggestion generation Celery task per D-19, D-20.
FINAL TASK in the analysis pipeline. Runs after grammar_check_task.

Pipeline: document_processing → nlp_analysis → scoring → grammar_check → llm_suggest (FINAL)

On LLM failure (D-17, ERROR-02): saves suggestions=None, still sets COMPLETE + emits 'complete'.
NEVER sets JobStatus.FAILED due to LLM error — partial results pattern.
"""

import asyncio
import json

import redis as redis_lib
from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.anchor_service import compute_suggestion_anchors
from app.services.llm.hf_openai_llm_service import HFOpenAILLMService
from app.services.llm.protocol import SuggestionsOutput  # noqa: TC001
from app.services.rag.embeddings import get_rag_embedding
from app.services.rag.retriever import retrieve_relevant_chunks
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask


# Module-level singleton — HF LLM (Qwen2.5) as primary
_llm_service = HFOpenAILLMService()

# Module-level Redis client — lazy init (same pattern as document_processing.py)
_redis_client: redis_lib.Redis | None = None


def _get_redis_client() -> redis_lib.Redis:
    """Lazy-init Redis client using Celery broker URL (same Redis as SSE pub/sub)."""
    global _redis_client  # noqa: PLW0603
    if _redis_client is None:
        _redis_client = redis_lib.from_url(celery_app.conf.broker_url)
    return _redis_client


def _repair_llm_output(raw_json: str, cv_text: str) -> str:
    """
    Repair incomplete LLM JSON output by inferring missing fields.

    Z AI GLM-4.5-flash often skips 'type', 'original_text', 'after_text' fields.
    This function attempts to fill in missing values before Pydantic validation.

    Args:
        raw_json: JSON string from LLM response
        cv_text: Original CV text for fuzzy matching original_text

    Returns:
        Repaired JSON string
    """
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        # If not valid JSON, return as-is (let validator handle it)
        return raw_json

    suggestions_list = data.get("suggestions", [])

    for card in suggestions_list:
        section = card.get("section", "unknown")
        card_suggestions = card.get("suggestions", [])

        for idx, suggestion in enumerate(card_suggestions):
            # Repair missing 'type' field
            if "type" not in suggestion or not suggestion["type"]:
                # Infer from suggestion text or default to action_verb
                text_lower = suggestion.get("text", "").lower()
                if any(word in text_lower for word in ["add", "include", "missing", "section"]):
                    suggestion["type"] = "missing_section"
                elif any(word in text_lower for word in ["metric", "quantif", "number", "%", "increased"]):
                    suggestion["type"] = "impact_metric"
                else:
                    suggestion["type"] = "action_verb"

            # Repair missing 'original_text' - try fuzzy match in CV
            if "original_text" not in suggestion or not suggestion["original_text"]:
                # Extract first meaningful phrase from suggestion text as fallback
                suggestion_text = suggestion.get("text", "")
                # For action_verb, look for weak verbs in CV
                if suggestion.get("type") == "action_verb":
                    # Look for sentences with common weak verbs in cv_text
                    weak_verbs = ["managed", "helped", "worked on", "assisted", "responsible for"]
                    for verb in weak_verbs:
                        if verb.lower() in cv_text.lower():
                            # Extract surrounding context (up to 100 chars)
                            idx = cv_text.lower().find(verb.lower())
                            start = max(0, idx - 20)
                            end = min(len(cv_text), idx + 80)
                            suggestion["original_text"] = cv_text[start:end].strip()
                            break
                    if not suggestion.get("original_text"):
                        suggestion["original_text"] = suggestion_text[:100]
                else:
                    # Fallback: use suggestion text truncated
                    suggestion["original_text"] = suggestion_text[:100]

            # Repair missing 'after_text' - None is acceptable per schema
            if "after_text" not in suggestion:
                suggestion["after_text"] = None

    return json.dumps(data)


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=1,  # LLM retries handled inside HFLLMService (3x)
    default_retry_delay=30,
)
def llm_suggest_task(self: Task, job_id: str) -> dict:  # noqa: PLR0915
    """
    LLM suggestion generation — FINAL TASK in analysis pipeline per D-19.

    Flow:
    1. Check Redis cache (llm_suggestions:{job_id}) — return cached if hit
    2. Set job.status = GENERATING in DB
    3. Emit 'generating_suggestions' SSE stage
    4. Retrieve CV text + sections from DB
    5. Retrieve RAG context (top-5 chunks) via pgvector cosine search
    6. Call HFLLMService.generate_suggestions() with 3x retry
    7. Validate JSON output with SuggestionsOutput Pydantic model
    8. Cache suggestions in Redis (TTL 24h per D-14)
    9. Save suggestions to jobs.suggestions JSONB + llm_tokens_used
    10. Set job.status = COMPLETE, emit 'complete' SSE

    On ANY exception (D-17, ERROR-02):
    - Save suggestions=None to DB
    - Set job.status = COMPLETE (partial result — scores/grammar still available)
    - Emit 'complete' SSE
    - NEVER set JobStatus.FAILED due to LLM error
    """
    cache_key = f"llm_suggestions:{job_id}"
    cache_ttl = 86400  # 24 hours per D-14

    async def _get_file_id() -> str:
        """Returns job.file_id from DB."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            return job.file_id if job else ""

    async def _get_job_data() -> tuple[str | None, list[dict] | None]:
        """Returns (cv_text, sections_list) from DB."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                text = job.result.get("text") if job.result else None
                sections = job.nlp_result.get("sections") if job.nlp_result else None
                return text, sections
            return None, None

    async def _set_generating_status() -> None:
        """Set job.status = GENERATING so frontend shows skeleton during LLM call."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.status = JobStatus.GENERATING
                await session.commit()

    async def _save_results(
        suggestions_json: list | None,
        tokens_used: int,
        file_id: str = "",
    ) -> None:
        """Save suggestions + token count + anchors to DB, set COMPLETE status."""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.suggestions = suggestions_json  # None = LLM failed (D-17)
                job.llm_tokens_used = tokens_used
                # Compute and save anchors when suggestions available (ANNOT-04, D-02)
                if suggestions_json and file_id:
                    job.suggestion_anchors = compute_suggestion_anchors(
                        file_id, suggestions_json
                    )
                job.status = JobStatus.COMPLETE  # THIS task sets COMPLETE
                await session.commit()

    # ─── Redis cache check (D-14) ───────────────────────────────────────────
    redis_client = _get_redis_client()
    cached = redis_client.get(cache_key)
    if cached:
        logger.info("LLM suggestions cache hit", extra={"job_id": job_id})
        cached_suggestions = json.loads(cached)
        job_file_id: str = asyncio.run(_get_file_id())
        asyncio.run(
            _save_results(cached_suggestions, tokens_used=0, file_id=job_file_id)
        )
        self.update_progress(job_id, "complete", 100, "Analysis complete!")
        return {"status": "complete", "job_id": job_id, "from_cache": True}

    # ─── Retrieve file_id for anchor computation (ANNOT-04) ─────────────────
    job_file_id = asyncio.run(_get_file_id())

    try:
        # ─── Set GENERATING status in DB ─────────────────────────────────────
        asyncio.run(_set_generating_status())

        # ─── Emit SSE stage ───────────────────────────────────────────────────
        self.update_progress(
            job_id,
            "generating_suggestions",
            90,
            "Generating AI improvement suggestions...",
        )

        # ─── Retrieve job data ────────────────────────────────────────────────
        cv_text, sections = asyncio.run(_get_job_data())
        if not cv_text:
            logger.warning(
                "llm_suggest_task: missing CV text", extra={"job_id": job_id}
            )
            asyncio.run(_save_results(None, tokens_used=0))
            self.update_progress(job_id, "complete", 100, "Analysis complete!")
            return {"status": "complete_partial", "job_id": job_id, "reason": "no_text"}

        sections = sections or []

        # ─── RAG retrieval (D-18: non-fatal if fails) ────────────────────────
        rag_context: list[str] = []
        try:
            query_embedding = get_rag_embedding(
                cv_text[:2000]
            )  # Truncate for embedding
            rag_context = asyncio.run(
                retrieve_relevant_chunks(
                    query_embedding=query_embedding,
                    section_type=None,  # Broad retrieval across all sections
                    limit=5,
                )
            )
        except Exception as rag_error:
            logger.warning(
                "RAG retrieval failed, proceeding without context",
                extra={"job_id": job_id, "error": str(rag_error)},
            )
            rag_context = []  # D-18: proceed with LLM call without RAG context

        # ─── LLM call (3x retry inside HFLLMService) ─────────────────────────
        result = _llm_service.generate_suggestions(
            cv_text=cv_text,
            sections=sections,
            rag_context=rag_context,
        )

        # ─── Validate JSON output per LLM-04 ─────────────────────────────────
        # First, repair missing fields that Z AI often skips (type, original_text, after_text)
        repaired_json = _repair_llm_output(result["raw_json"], cv_text)
        validated: SuggestionsOutput = _llm_service.validate_output(repaired_json)
        suggestions_list = [card.model_dump() for card in validated.suggestions]

        prompt_tokens = result["prompt_tokens"]
        completion_tokens = result["completion_tokens"]
        total_tokens = prompt_tokens + completion_tokens

        # ─── Cache in Redis (D-14: TTL 24h) ──────────────────────────────────
        redis_client.setex(cache_key, cache_ttl, json.dumps(suggestions_list))

        # ─── Save to DB + set COMPLETE ────────────────────────────────────────
        asyncio.run(
            _save_results(
                suggestions_list, tokens_used=total_tokens, file_id=job_file_id
            )
        )

        # ─── Emit final 'complete' SSE stage ─────────────────────────────────
        self.update_progress(job_id, "complete", 100, "Analysis complete!")

        logger.info(
            "LLM suggestions generated and saved",
            extra={
                "job_id": job_id,
                "suggestion_cards": len(suggestions_list),
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
            },
        )
        return {"status": "complete", "job_id": job_id, "cards": len(suggestions_list)}

    except Exception as e:
        # ─── D-17, ERROR-02: LLM failure → partial result, NEVER FAILED ──────
        # Scores, grammar, ATS checks are still available to the user.
        # suggestions=None signals "AI suggestions unavailable" state in frontend.
        logger.error(
            "llm_suggest_task failed — returning partial result",
            extra={"job_id": job_id, "error": str(e)},
        )
        asyncio.run(_save_results(None, tokens_used=0))
        self.update_progress(
            job_id, "complete", 100, "Analysis complete (AI suggestions unavailable)"
        )
        return {"status": "complete_partial", "job_id": job_id, "error": str(e)}

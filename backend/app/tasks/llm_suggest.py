import asyncio
import json
from datetime import UTC, datetime

import redis as redis_lib
from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.anchor_service import compute_suggestion_anchors
from app.services.llm.koboi_llm_service import KoboiLLMService
from app.services.llm.protocol import SuggestionsOutput  # noqa: TC001
from app.services.rag.embeddings import get_rag_embedding
from app.services.rag.ingestor import ingest_cv_for_user
from app.services.rag.retriever import retrieve_relevant_chunks
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask

_llm_service = KoboiLLMService()
_redis_client: redis_lib.Redis | None = None


def _get_redis_client() -> redis_lib.Redis:
    global _redis_client  # noqa: PLW0603
    if _redis_client is None:
        _redis_client = redis_lib.from_url(celery_app.conf.broker_url)
    return _redis_client


def _repair_llm_output(raw_json: str, cv_text: str) -> str:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return raw_json

    suggestions_list = data.get("suggestions", [])

    for card in suggestions_list:
        _section = card.get("section", "unknown")
        card_suggestions = card.get("suggestions", [])

        for idx, suggestion in enumerate(card_suggestions):
            if "type" not in suggestion or not suggestion["type"]:
                text_lower = suggestion.get("text", "").lower()
                if any(
                    word in text_lower
                    for word in ["add", "include", "missing", "section"]
                ):
                    suggestion["type"] = "missing_section"
                elif any(
                    word in text_lower
                    for word in ["metric", "quantif", "number", "%", "increased"]
                ):
                    suggestion["type"] = "impact_metric"
                else:
                    suggestion["type"] = "action_verb"

            if "original_text" not in suggestion or not suggestion["original_text"]:
                suggestion_text = suggestion.get("text", "")
                if suggestion.get("type") == "action_verb":
                    weak_verbs = [
                        "managed",
                        "helped",
                        "worked on",
                        "assisted",
                        "responsible for",
                    ]
                    for verb in weak_verbs:
                        if verb.lower() in cv_text.lower():
                            idx = cv_text.lower().find(verb.lower())
                            start = max(0, idx - 20)
                            end = min(len(cv_text), idx + 80)
                            suggestion["original_text"] = cv_text[start:end].strip()
                            break
                    if not suggestion.get("original_text"):
                        suggestion["original_text"] = suggestion_text[:100]
                else:
                    suggestion["original_text"] = suggestion_text[:100]

            if "after_text" not in suggestion:
                suggestion["after_text"] = None

    return json.dumps(data)


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=1,
    default_retry_delay=30,
)
def llm_suggest_task(self: Task, job_id: str) -> dict:
    cache_key = f"llm_suggestions:{job_id}"
    cache_ttl = 86400

    async def _get_file_id() -> str:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            return job.file_id if job else ""

    async def _get_job_data() -> tuple[str | None, list[dict] | None, str | None]:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                text = job.result.get("text") if job.result else None
                sections = job.nlp_result.get("sections") if job.nlp_result else None
                user_id = str(job.user_id) if job.user_id else None
                return text, sections, user_id
            return None, None, None

    async def _set_generating_status() -> None:
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
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.suggestions = suggestions_json
                job.llm_tokens_used = tokens_used
                if suggestions_json and file_id:
                    job.suggestion_anchors = compute_suggestion_anchors(
                        file_id, suggestions_json
                    )

                cv_document = {
                    "sections": [],
                    "metadata": {
                        "extracted_at": datetime.now(UTC).isoformat(),
                        "parser_version": "1.0",
                    },
                }
                if job.nlp_result and "sections" in job.nlp_result:
                    for section_data in job.nlp_result["sections"]:
                        cv_document["sections"].append(
                            {
                                "type": section_data.get("type", "unknown"),
                                "title": section_data.get("title", ""),
                                "content": section_data.get("text", ""),
                                "items": section_data.get("items", []),
                            }
                        )
                if suggestions_json:
                    cv_document["suggestions"] = [
                        {
                            "section": (
                                s.get("section", "unknown")
                                if isinstance(s, dict)
                                else s.section
                            ),
                            "suggestions": [
                                {
                                    "priority": (
                                        sug.get("priority", "medium")
                                        if isinstance(sug, dict)
                                        else sug.priority
                                    ),
                                    "text": (
                                        sug.get("text", "")
                                        if isinstance(sug, dict)
                                        else sug.text
                                    ),
                                    "type": (
                                        sug.get("type", "action_verb")
                                        if isinstance(sug, dict)
                                        else sug.type
                                    ),
                                }
                                for sug in (
                                    s.get("suggestions", [])
                                    if isinstance(s, dict)
                                    else s.suggestions
                                )
                            ],
                        }
                        for s in suggestions_json
                    ]
                if job.scores:
                    cv_document["scores"] = {
                        "overall": (
                            job.scores.get("overall")
                            if isinstance(job.scores, dict)
                            else job.scores.overall
                        ),
                        "clarity": (
                            job.scores.get("clarity")
                            if isinstance(job.scores, dict)
                            else job.scores.clarity
                        ),
                        "impact": (
                            job.scores.get("impact")
                            if isinstance(job.scores, dict)
                            else job.scores.impact
                        ),
                        "completeness": (
                            job.scores.get("completeness")
                            if isinstance(job.scores, dict)
                            else job.scores.completeness
                        ),
                        "relevance": (
                            job.scores.get("relevance")
                            if isinstance(job.scores, dict)
                            else job.scores.relevance
                        ),
                    }
                job.cv_document = cv_document

                job.status = JobStatus.COMPLETE
                await session.commit()

    redis_client = _get_redis_client()
    cached = redis_client.get(cache_key)
    if cached:
        logger.info("llm_suggest_cache_hit", job_id=job_id)
        cached_suggestions = json.loads(cached)
        job_file_id: str = asyncio.run(_get_file_id())
        asyncio.run(
            _save_results(cached_suggestions, tokens_used=0, file_id=job_file_id)
        )
        self.update_progress(job_id, "complete", 100, "Analysis complete!")
        return {"status": "complete", "job_id": job_id, "from_cache": True}

    job_file_id = asyncio.run(_get_file_id())

    try:
        asyncio.run(_set_generating_status())
        self.update_progress(
            job_id,
            "generating_suggestions",
            90,
            "Generating AI improvement suggestions...",
        )
        cv_text, sections, user_id = asyncio.run(_get_job_data())
        if not cv_text:
            logger.warning("llm_suggest_no_text", job_id=job_id)
            asyncio.run(_save_results(None, tokens_used=0))
            self.update_progress(job_id, "complete", 100, "Analysis complete!")
            return {"status": "complete_partial", "job_id": job_id, "reason": "no_text"}

        sections = sections or []

        if user_id:
            try:

                async def _ingest() -> None:
                    async with async_session_maker() as session:
                        await ingest_cv_for_user(cv_text, job_id, user_id, session)

                asyncio.run(_ingest())
                logger.info("cv_ingested_for_user", job_id=job_id, user_id=user_id)
            except Exception as ingest_error:
                logger.warning(
                    "cv_ingest_failed", job_id=job_id, error=str(ingest_error)
                )

        rag_context: list[str] = []
        try:
            query_embedding = get_rag_embedding(cv_text[:2000])
            rag_context = asyncio.run(
                retrieve_relevant_chunks(
                    query_embedding=query_embedding,
                    user_id=user_id,
                    section_type=None,
                    limit=5,
                )
            )
        except Exception as rag_error:
            logger.warning(
                "rag_failed_in_llm",
                job_id=job_id,
                error=str(rag_error),
            )
            rag_context = []

        result = _llm_service.generate_suggestions(
            cv_text=cv_text,
            sections=sections,
            rag_context=rag_context,
        )

        repaired_json = _repair_llm_output(result["raw_json"], cv_text)
        validated: SuggestionsOutput = _llm_service.validate_output(repaired_json)
        suggestions_list = [card.model_dump() for card in validated.suggestions]

        prompt_tokens = result["prompt_tokens"]
        completion_tokens = result["completion_tokens"]
        total_tokens = prompt_tokens + completion_tokens
        redis_client.setex(cache_key, cache_ttl, json.dumps(suggestions_list))

        asyncio.run(
            _save_results(
                suggestions_list, tokens_used=total_tokens, file_id=job_file_id
            )
        )

        self.update_progress(job_id, "complete", 100, "Analysis complete!")

        logger.info(
            "llm_suggest_done",
            job_id=job_id,
            suggestion_cards=len(suggestions_list),
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )
        return {"status": "complete", "job_id": job_id, "cards": len(suggestions_list)}

    except Exception as e:
        logger.error("llm_suggest_failed", job_id=job_id, error=str(e), exc_info=True)
        asyncio.run(_save_results(None, tokens_used=0))
        self.update_progress(
            job_id, "complete", 100, "Analysis complete (AI suggestions unavailable)"
        )
        return {"status": "complete_partial", "job_id": job_id, "error": str(e)}

import asyncio
import json
import re
from datetime import UTC, datetime

import redis as redis_lib
from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models import Job, JobStatus
from app.services.anchor_service import compute_suggestion_anchors
from app.services.llm.koboi_llm_service import KoboiLLMService
from app.services.llm.protocol import SuggestionsOutput  # noqa: TC001
from app.services.rag.embeddings import get_rag_embedding
from app.services.rag.ingestor import ingest_cv_for_user
from app.services.rag.retriever import retrieve_relevant_chunks
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask, mark_job_failed

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
                            pos = cv_text.lower().find(verb.lower())
                            start = max(0, pos - 20)
                            end = min(len(cv_text), pos + 80)
                            suggestion["original_text"] = cv_text[start:end].strip()
                            break
                    if not suggestion.get("original_text"):
                        suggestion["original_text"] = suggestion_text[:100]
                else:
                    suggestion["original_text"] = suggestion_text[:100]

            if "after_text" not in suggestion:
                suggestion["after_text"] = None

            # Normalize whitespace: collapse newlines/tabs/multiple spaces into one space
            for field in ("original_text", "after_text"):
                val = suggestion.get(field)
                if val and isinstance(val, str):
                    suggestion[field] = re.sub(r"\s+", " ", val).strip()

    return json.dumps(data)


def _build_cv_document(
    nlp_result: dict | None,
    suggestions_json: list | None,
    scores: dict | None,
) -> dict:
    cv_document: dict = {
        "sections": [],
        "metadata": {
            "extracted_at": datetime.now(UTC).isoformat(),
            "parser_version": "1.0",
        },
    }

    if nlp_result and "sections" in nlp_result:
        for section_data in nlp_result["sections"]:
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
                    s.get("section", "unknown") if isinstance(s, dict) else s.section
                ),
                "suggestions": [
                    {
                        "priority": (
                            sug.get("priority", "medium")
                            if isinstance(sug, dict)
                            else sug.priority
                        ),
                        "text": (
                            sug.get("text", "") if isinstance(sug, dict) else sug.text
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

    if scores:
        _s = scores if isinstance(scores, dict) else scores.__dict__
        clarity = _s.get("clarity", 0) or 0
        impact = _s.get("impact", 0) or 0
        completeness = _s.get("completeness", 0) or 0
        relevance = _s.get("relevance", 0) or 0
        overall = _s.get("overall") or int(
            impact * 0.35 + clarity * 0.30 + relevance * 0.20 + completeness * 0.15
        )
        cv_document["scores"] = {
            "overall": overall,
            "clarity": clarity,
            "impact": impact,
            "completeness": completeness,
            "relevance": relevance,
        }

    return cv_document


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=1,
    default_retry_delay=30,
)
def llm_suggest_task(self: Task, job_id: str) -> dict:
    redis_client = _get_redis_client()
    cache_key = f"llm_suggestions:{job_id}"
    cache_ttl = 86400

    async def _run() -> dict:
        # Load all job data we'll need upfront
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()

            if not job:
                return {"error": f"Job {job_id} not found"}

            file_id = job.file_id or ""
            cv_text = job.result.get("text") if job.result else None
            sections = job.nlp_result.get("sections") if job.nlp_result else None
            user_id = str(job.user_id) if job.user_id else None
            nlp_result = job.nlp_result
            scores = job.scores

            job.status = JobStatus.GENERATING
            await session.commit()

        # Cache hit — skip LLM, just save and complete
        cached = redis_client.get(cache_key)
        if cached:
            logger.info("llm_suggest_cache_hit", job_id=job_id)
            cached_suggestions = json.loads(cached)
            await _persist_results(
                job_id, cached_suggestions, 0, file_id, nlp_result, scores
            )
            self.update_progress(job_id, "complete", 100, "Analysis complete!")
            return {"status": "complete", "job_id": job_id, "from_cache": True}

        self.update_progress(
            job_id,
            "generating_suggestions",
            90,
            "Generating AI improvement suggestions...",
        )

        if not cv_text:
            logger.warning("llm_suggest_no_text", job_id=job_id)
            await _persist_results(job_id, None, 0, file_id, nlp_result, scores)
            self.update_progress(job_id, "complete", 100, "Analysis complete!")
            return {"status": "complete_partial", "job_id": job_id, "reason": "no_text"}

        sections = sections or []

        # RAG ingestion (optional, non-blocking on failure)
        if user_id:
            try:
                async with async_session_maker() as session:
                    await ingest_cv_for_user(cv_text, job_id, user_id, session)
                logger.info("cv_ingested_for_user", job_id=job_id, user_id=user_id)
            except Exception as ingest_error:
                logger.warning(
                    "cv_ingest_failed", job_id=job_id, error=str(ingest_error)
                )

        # RAG retrieval
        rag_context: list[str] = []
        try:
            query_embedding = get_rag_embedding(cv_text[:2000])
            rag_context = await retrieve_relevant_chunks(
                query_embedding=query_embedding,
                user_id=user_id,
                section_type=None,
                limit=5,
            )
        except Exception as rag_error:
            logger.warning("rag_failed_in_llm", job_id=job_id, error=str(rag_error))

        # LLM generation — wrapped so a bad LLM response still yields COMPLETE
        suggestions_list: list | None = None
        total_tokens = 0
        try:
            result = _llm_service.generate_suggestions(
                cv_text=cv_text,
                sections=sections,
                rag_context=rag_context,
            )
            repaired_json = _repair_llm_output(result["raw_json"], cv_text)
            validated: SuggestionsOutput = _llm_service.validate_output(repaired_json)
            suggestions_list = [card.model_dump() for card in validated.suggestions]
            total_tokens = result["prompt_tokens"] + result["completion_tokens"]
            redis_client.setex(cache_key, cache_ttl, json.dumps(suggestions_list))
            logger.info(
                "llm_suggest_done",
                job_id=job_id,
                suggestion_cards=len(suggestions_list),
                prompt_tokens=result["prompt_tokens"],
                completion_tokens=result["completion_tokens"],
            )
        except Exception as llm_err:
            logger.error(
                "llm_suggest_failed",
                job_id=job_id,
                error=str(llm_err),
                exc_info=True,
            )

        await _persist_results(
            job_id, suggestions_list, total_tokens, file_id, nlp_result, scores
        )
        self.update_progress(job_id, "complete", 100, "Analysis complete!")
        return {
            "status": (
                "complete" if suggestions_list is not None else "complete_partial"
            ),
            "job_id": job_id,
            "cards": len(suggestions_list) if suggestions_list else 0,
        }

    async def _persist_results(
        jid: str,
        suggestions_json: list | None,
        tokens_used: int,
        file_id: str,
        nlp_result: dict | None,
        scores: dict | None,
    ) -> None:
        """Write suggestions + cv_document + COMPLETE atomically."""
        _SCORE_WEIGHTS = {
            "impact": 0.35,
            "clarity": 0.30,
            "relevance": 0.20,
            "completeness": 0.15,
        }

        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == jid)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if not job:
                return

            # Apply grammar clarity adjustment — grammar_check_task has already run at this point
            if scores and job.grammar_issues:
                issue_count = len(job.grammar_issues)
                if issue_count > 30:
                    grammar_penalty = -10
                elif issue_count > 20:
                    grammar_penalty = -7
                elif issue_count > 10:
                    grammar_penalty = -5
                elif issue_count > 5:
                    grammar_penalty = -3
                else:
                    grammar_penalty = 0

                if grammar_penalty < 0:
                    scores = dict(scores)
                    scores["clarity"] = max(
                        0, min(100, scores.get("clarity", 50) + grammar_penalty)
                    )
                    scores["overall"] = max(
                        0,
                        min(
                            100,
                            int(
                                sum(
                                    scores.get(d, 50) * w
                                    for d, w in _SCORE_WEIGHTS.items()
                                )
                            ),
                        ),
                    )
                    scores["grammar_clarity_penalty"] = grammar_penalty
                    job.scores = scores
                    logger.info(
                        "grammar_clarity_adjustment",
                        job_id=jid,
                        issue_count=issue_count,
                        penalty=grammar_penalty,
                        clarity_after=scores["clarity"],
                    )

            job.suggestions = suggestions_json
            job.llm_tokens_used = tokens_used

            if suggestions_json and file_id:
                job.suggestion_anchors = compute_suggestion_anchors(
                    file_id, suggestions_json
                )

            job.cv_document = _build_cv_document(nlp_result, suggestions_json, scores)
            job.status = JobStatus.COMPLETE
            await session.commit()

    try:
        return asyncio.run(_run())
    except Exception as e:
        logger.error("llm_task_error", job_id=job_id, error=str(e), exc_info=True)
        asyncio.run(mark_job_failed(job_id, str(e)))
        return {"status": "failed", "job_id": job_id, "error": str(e)}

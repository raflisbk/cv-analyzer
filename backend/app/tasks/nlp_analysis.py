"""
NLP analysis Celery task per D-17, D-18.
Second task in the analysis pipeline chain.
Reads parsed text from DB, runs section detection + entity extraction + skill extraction.
Saves nlp_result JSONB column to job.
"""

import asyncio

from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.nlp.entity_extractor import extract_entities
from app.services.nlp.section_detector import detect_sections
from app.services.nlp.skill_extractor import extract_skills
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=30,
)
def nlp_analyze_task(self: Task, job_id: str) -> dict:
    """
    NLP analysis task: section detection + entity extraction + skill extraction.
    Per D-17: second task in chain. Per D-18: emits 'analyzing_sections' and 'extracting_skills'.

    Reads job.result['text'] from DB (set by process_document_task).
    Writes nlp_result JSONB column to job.
    Does NOT emit 'complete' — that is grammar_check_task's responsibility.
    """

    async def _get_job_text() -> str | None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job and job.result:
                return job.result.get("text")
            return None

    async def _save_nlp_result(nlp_result: dict) -> None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.nlp_result = nlp_result
                await session.commit()

    async def _mark_failed(error_msg: str) -> None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.status = JobStatus.FAILED
                job.error = error_msg
                await session.commit()

    try:
        text = asyncio.run(_get_job_text())
        if not text:
            msg = f"No parsed text found for job {job_id}"
            logger.error("NLP task: missing text", extra={"job_id": job_id})
            asyncio.run(_mark_failed(msg))
            self.update_progress(job_id, "failed", 0, msg)
            return {"error": msg}

        # Stage: analyzing sections (30%)
        self.update_progress(
            job_id, "analyzing_sections", 30, "Detecting CV sections..."
        )
        sections = detect_sections(text)

        # Stage: extracting skills (60%)
        self.update_progress(
            job_id, "extracting_skills", 60, "Extracting skills and entities..."
        )
        skills = extract_skills(text)
        entities = extract_entities(text, sections=sections)

        nlp_result = {
            "sections": [
                {
                    "type": s.type,
                    "text": s.text,
                    "entities": s.entities,
                }
                for s in sections
            ],
            "skills": skills,
            "entities": entities,
        }

        asyncio.run(_save_nlp_result(nlp_result))

        logger.info(
            "NLP analysis complete",
            extra={
                "job_id": job_id,
                "section_count": len(sections),
                "skill_count": len(skills),
            },
        )
        return {"status": "nlp_complete", "job_id": job_id}  # noqa: TRY300

    except Exception as e:
        # Catch ALL exceptions per Pitfall 4 — must NOT re-raise or chain breaks silently
        error_msg = f"NLP analysis failed: {e!s}"
        logger.error(
            "nlp_analyze_task failed",
            extra={"job_id": job_id, "error": error_msg},
        )
        asyncio.run(_mark_failed(error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

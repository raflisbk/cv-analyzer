"""
Grammar check + ATS check Celery task per D-17, D-18.
Mid-pipeline task in the analysis pipeline chain. llm_suggest_task runs after this.
Runs grammar check and ATS check, saves results, then continues to llm_suggest_task.
"""

import asyncio

from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.ats.checker import check_ats_compatibility
from app.services.grammar.checker import check_grammar
from app.services.nlp.section_detector import CvSection, detect_sections
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=2,
    default_retry_delay=30,
)
def grammar_check_task(self: Task, job_id: str) -> dict:  # noqa: PLR0915
    """
    Grammar check + ATS check task.
    Phase 3: no longer final — llm_suggest_task chains after this task.

    Reads job.result['text'] and job.nlp_result from DB.
    Writes grammar_issues and ats_checks JSONB columns.
    Sets job.status = ANALYZING (pipeline continues to llm_suggest_task).
    Per D-19: emits 'grammar_check' stage only. llm_suggest_task emits 'complete'.
    """

    async def _get_job_data() -> tuple[str | None, list[dict] | None]:
        """Returns (cv_text, nlp_sections_list)"""
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                text = job.result.get("text") if job.result else None
                sections_raw = (
                    job.nlp_result.get("sections") if job.nlp_result else None
                )
                return text, sections_raw
            return None, None

    async def _save_final_results(
        grammar_issues: list[dict],
        ats_checks: list[dict],
    ) -> None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.grammar_issues = grammar_issues
                job.ats_checks = ats_checks
                job.status = (
                    JobStatus.ANALYZING
                )  # Pipeline continues to llm_suggest_task (Phase 3 D-19)
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
        self.update_progress(
            job_id, "grammar_check", 90, "Checking grammar and ATS compatibility..."
        )

        text, sections_raw = asyncio.run(_get_job_data())
        if not text:
            msg = f"No CV text for grammar check, job {job_id}"
            logger.error("grammar_check_task: missing text", extra={"job_id": job_id})
            asyncio.run(_mark_failed(msg))
            self.update_progress(job_id, "failed", 0, msg)
            return {"error": msg}

        # Grammar check
        grammar_issues = check_grammar(text)

        # Reconstruct CvSection objects from saved nlp_result for ATS checker
        sections: list[CvSection] = []
        if sections_raw:
            for idx, sec in enumerate(sections_raw):
                sections.append(
                    CvSection(
                        type=sec.get("type", "other"),
                        text=sec.get("text", ""),
                        start_line=idx * 5,
                    )
                )
        else:
            # Fallback: re-detect sections from text
            sections = detect_sections(text)

        # ATS check
        ats_checks = check_ats_compatibility(text, sections=sections)

        asyncio.run(_save_final_results(grammar_issues, ats_checks))

        logger.info(
            "Grammar check and ATS analysis complete (pipeline continues to llm_suggest_task)",
            extra={
                "job_id": job_id,
                "grammar_issues": len(grammar_issues),
                "ats_checks": len(ats_checks),
            },
        )
        return {"status": "complete", "job_id": job_id}  # noqa: TRY300

    except Exception as e:
        # Catch ALL exceptions per Pitfall 4 — do NOT re-raise
        error_msg = f"Grammar/ATS check failed: {e!s}"
        logger.error(
            "grammar_check_task failed",
            extra={"job_id": job_id, "error": error_msg},
        )
        asyncio.run(_mark_failed(error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

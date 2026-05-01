"""Grammar check + ATS check Celery task."""

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
    """Grammar check + ATS check. llm_suggest_task runs after this."""

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
                job.status = JobStatus.ANALYZING
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
            logger.error("grammar_no_text", job_id=job_id)
            asyncio.run(_mark_failed(msg))
            self.update_progress(job_id, "failed", 0, msg)
            return {"error": msg}

        grammar_issues = check_grammar(text)
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
            sections = detect_sections(text)

        ats_checks = check_ats_compatibility(text, sections=sections)

        asyncio.run(_save_final_results(grammar_issues, ats_checks))

        logger.info(
            "grammar_ats_done",
            job_id=job_id,
            grammar_issues=len(grammar_issues),
            ats_checks=len(ats_checks),
        )
        return {"status": "complete", "job_id": job_id}  # noqa: TRY300

    except Exception as e:
        error_msg = f"Grammar/ATS check failed: {e!s}"
        logger.error(
            "grammar_task_failed",
            job_id=job_id,
            error=error_msg,
        )
        asyncio.run(_mark_failed(error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

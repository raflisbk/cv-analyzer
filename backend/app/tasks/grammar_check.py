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
from app.tasks.document_processing import ProgressTask, mark_job_failed


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=2,
    default_retry_delay=30,
)
def grammar_check_task(self: Task, job_id: str) -> dict:
    async def _run() -> dict:
        self.update_progress(
            job_id, "grammar_check", 90, "Checking grammar and ATS compatibility..."
        )

        # Load job data
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()

            if not job or not job.result:
                msg = f"No CV text for grammar check, job {job_id}"
                logger.error("grammar_no_text", job_id=job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = msg
                    await session.commit()
                self.update_progress(job_id, "failed", 0, msg)
                return {"error": msg}

            text = job.result.get("text", "")
            sections_raw = job.nlp_result.get("sections") if job.nlp_result else None

        # Grammar + ATS work (sync, LLM call) — outside DB session
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

        # Save results
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.grammar_issues = grammar_issues
                job.ats_checks = ats_checks
                job.status = JobStatus.ANALYZING
                await session.commit()

        logger.info(
            "grammar_ats_done",
            job_id=job_id,
            grammar_issues=len(grammar_issues),
            ats_checks=len(ats_checks),
        )
        return {"status": "complete", "job_id": job_id}

    try:
        return asyncio.run(_run())
    except Exception as e:
        error_msg = f"Grammar/ATS check failed: {e!s}"
        logger.error(
            "grammar_task_failed", job_id=job_id, error=error_msg, exc_info=True
        )
        asyncio.run(mark_job_failed(job_id, error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

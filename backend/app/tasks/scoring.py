"""
CV scoring Celery task per D-17, D-18.
Third task in the analysis pipeline chain.
Reads nlp_result from DB, runs OpenAI embedding scoring, saves scores JSONB column.
"""

import asyncio

from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.scoring.scorer import score_cv
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=60,  # Longer delay for OpenAI rate limits
)
def score_cv_task(self: Task, job_id: str) -> dict:
    """
    CV scoring task: OpenAI embedding cosine similarity scoring.
    Per D-17: third task in chain. Per D-18: emits 'scoring'.

    Reads job.result['text'] from DB (original parsed text for full-CV scoring).
    Writes scores JSONB column to job.
    Does NOT emit 'complete' — that is grammar_check_task's responsibility.
    """

    async def _get_cv_text() -> str | None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job and job.result:
                return job.result.get("text")
            return None

    async def _save_scores(scores: dict) -> None:
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.scores = scores
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
        self.update_progress(job_id, "scoring", 75, "Scoring CV with AI embeddings...")

        text = asyncio.run(_get_cv_text())
        if not text:
            msg = f"No CV text for scoring, job {job_id}"
            logger.error("score_cv_task: missing text", extra={"job_id": job_id})
            asyncio.run(_mark_failed(msg))
            self.update_progress(job_id, "failed", 0, msg)
            return {"error": msg}

        # score_cv raises on OpenAI failure after 3 retries (D-10)
        scores = score_cv(text)
        asyncio.run(_save_scores(scores))

        logger.info(
            "CV scoring complete",
            extra={"job_id": job_id, "overall_score": scores.get("overall")},
        )
        return {"status": "scoring_complete", "job_id": job_id}  # noqa: TRY300

    except Exception as e:
        # Catch ALL exceptions per Pitfall 4 — do NOT re-raise
        error_msg = f"CV scoring failed: {e!s}"
        logger.error(
            "score_cv_task failed",
            extra={"job_id": job_id, "error": error_msg},
        )
        asyncio.run(_mark_failed(error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

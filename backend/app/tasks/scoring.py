"""CV scoring Celery task."""

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
    default_retry_delay=60,
)
def score_cv_task(self: Task, job_id: str) -> dict:
    """CV scoring via embedding cosine similarity."""

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
            logger.error("scoring_no_text", job_id=job_id)
            asyncio.run(_mark_failed(msg))
            self.update_progress(job_id, "failed", 0, msg)
            return {"error": msg}

        scores = score_cv(text)
        try:
            from app.services.llm.score_explainer import ScoreExplainerService

            explainer = ScoreExplainerService()
            reasonings = explainer.explain_scores(text, scores)
            scores["reasonings"] = reasonings
        except Exception as e:
            logger.error("score_explanation_failed", error=str(e), exc_info=True)
            scores["reasonings"] = {}

        asyncio.run(_save_scores(scores))

        logger.info(
            "scoring_done",
            job_id=job_id,
            overall_score=scores.get("overall"),
        )
        return {"status": "scoring_complete", "job_id": job_id}  # noqa: TRY300

    except Exception as e:
        error_msg = f"CV scoring failed: {e!s}"
        logger.error("scoring_failed", job_id=job_id, error=error_msg, exc_info=True)
        asyncio.run(_mark_failed(error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

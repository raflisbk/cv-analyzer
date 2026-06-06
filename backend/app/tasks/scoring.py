import asyncio

from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models import Job, JobStatus
from app.services.scoring.scorer import score_cv
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask, mark_job_failed


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=60,
)
def score_cv_task(self: Task, job_id: str) -> dict:
    async def _run() -> dict:
        self.update_progress(job_id, "scoring", 75, "Scoring CV with AI embeddings...")

        # Load CV text
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()

            if not job or not job.result:
                msg = f"No CV text for scoring, job {job_id}"
                logger.error("scoring_no_text", job_id=job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = msg
                    await session.commit()
                self.update_progress(job_id, "failed", 0, msg)
                return {"error": msg}

            text = job.result.get("text", "")

        # Scoring work (sync, makes HTTP calls) — outside DB session
        scores = score_cv(text)
        try:
            from app.services.llm.score_explainer import ScoreExplainerService

            explainer = ScoreExplainerService()
            reasonings = explainer.explain_scores(text, scores)
            scores["reasonings"] = reasonings
        except Exception as e:
            logger.error("score_explanation_failed", error=str(e), exc_info=True)
            scores["reasonings"] = {}

        # Save scores
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.scores = scores
                await session.commit()

        logger.info(
            "scoring_done",
            job_id=job_id,
            overall_score=scores.get("overall"),
        )
        return {"status": "scoring_complete", "job_id": job_id}

    try:
        return asyncio.run(_run())
    except Exception as e:
        error_msg = f"CV scoring failed: {e!s}"
        logger.error("scoring_failed", job_id=job_id, error=error_msg, exc_info=True)
        asyncio.run(mark_job_failed(job_id, error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

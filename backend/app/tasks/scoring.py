import asyncio

from celery import Task
from sqlalchemy import func, select

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
            jd_text = job.jd_text or None
            nlp_result = job.nlp_result or {}
            nlp_sections = nlp_result.get("sections") or None

            # Prefer explicit user selection; fall back to LLM-detected role from NLP stage
            target_role = job.target_role or nlp_result.get("detected_role") or None
            if not job.target_role and target_role:
                logger.info("using_detected_role", job_id=job_id, detected_role=target_role)

        # Scoring work (sync, makes HTTP calls) — outside DB session
        scores = score_cv(text, jd_text=jd_text, target_role=target_role, nlp_sections=nlp_sections)

        # LLM scorer already includes per-dimension reasoning — no separate explainer needed.
        # Fall back to ScoreExplainerService only if reasonings are missing (e.g. fallback path).
        if not scores.get("reasonings"):
            try:
                from app.services.llm.score_explainer import ScoreExplainerService

                explainer = ScoreExplainerService()
                scores["reasonings"] = explainer.explain_scores(text, scores)
            except Exception as e:
                logger.error("score_explanation_failed", error=str(e), exc_info=True)
                scores["reasonings"] = {}

        # Compute benchmark percentile (how this CV compares to all previously scored CVs)
        benchmark: dict = {}
        try:
            from sqlalchemy import cast, Integer, func as sa_func
            async with async_session_maker() as session:
                overall_score = scores.get("overall", 0)

                # Only compare against jobs scored with the same method to avoid
                # mixing embedding-based scores with LLM scores.
                same_method_filter = Job.scores["scoring_method"].astext == "llm"

                total_count_result = await session.execute(
                    select(sa_func.count(Job.id)).where(
                        Job.status == JobStatus.COMPLETE,
                        Job.scores.isnot(None),
                        Job.id != job_id,
                        same_method_filter,
                    )
                )
                total_count: int = total_count_result.scalar() or 0

                if total_count > 0:
                    better_count_result = await session.execute(
                        select(sa_func.count(Job.id)).where(
                            Job.status == JobStatus.COMPLETE,
                            Job.scores.isnot(None),
                            Job.id != job_id,
                            same_method_filter,
                            cast(Job.scores["overall"].astext, Integer) <= overall_score,
                        )
                    )
                    better_count: int = better_count_result.scalar() or 0
                    percentile = round((better_count / total_count) * 100)
                    benchmark = {"percentile": percentile, "sample_size": total_count}
        except Exception as e:
            logger.warning("benchmark_computation_failed", error=str(e))

        scores["benchmark"] = benchmark

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

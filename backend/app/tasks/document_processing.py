import asyncio
import json
from datetime import UTC, datetime

import redis
from celery import Task
from celery.exceptions import MaxRetriesExceededError
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models import Job, JobStatus
from app.services.parser import ParsingError, parse_document
from app.services.storage import storage_service
from app.tasks.celery_app import celery_app

redis_client = redis.from_url(
    celery_app.conf.broker_url.replace("redis://", "redis://")
)

_DLQ_KEY = "dlq:failed_tasks"
_DLQ_MAX = 1000


async def mark_job_failed(job_id: str, error_msg: str) -> None:
    """Mark a job as FAILED in the DB. Used by all tasks on error paths."""
    async with async_session_maker() as session:
        stmt = select(Job).where(Job.id == job_id)
        result = await session.execute(stmt)
        job = result.scalar_one_or_none()
        if job:
            job.status = JobStatus.FAILED
            job.error = error_msg
            await session.commit()


class ProgressTask(Task):
    def update_progress(self, job_id: str, stage: str, percentage: int, message: str):
        progress_data = {
            "stage": stage,
            "percentage": percentage,
            "message": message,
            "job_id": job_id,
        }
        redis_client.setex(f"job:progress:{job_id}", 3600, json.dumps(progress_data))
        redis_client.publish(f"job:updates:{job_id}", json.dumps(progress_data))
        logger.info(
            "progress_update",
            job_id=job_id,
            stage=stage,
            percentage=percentage,
        )

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        job_id = kwargs.get("job_id") or (args[0] if args else "unknown")
        entry = json.dumps(
            {
                "task": self.name,
                "task_id": task_id,
                "job_id": job_id,
                "error": str(exc),
                "traceback": str(einfo),
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )
        try:
            redis_client.lpush(_DLQ_KEY, entry)
            redis_client.ltrim(_DLQ_KEY, 0, _DLQ_MAX - 1)
        except Exception:
            logger.warning("dlq_push_failed", task=self.name, job_id=job_id)
        logger.error(
            "task_dlq",
            task=self.name,
            task_id=task_id,
            job_id=job_id,
            error=str(exc),
        )


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=60,
)
def process_document_task(self, job_id: str, file_id: str, file_metadata: dict):
    async def _run() -> dict:
        self.update_progress(
            job_id, "extracting", 25, "Extracting text from document..."
        )
        file_content = storage_service.get_file(file_id)
        text, metadata = parse_document(file_content, file_metadata["extension"])

        logger.info(
            "document_parsed",
            job_id=job_id,
            text_length=len(text),
            extraction_method=metadata.get("extraction_method"),
            quality_score=metadata.get("quality_score"),
        )

        self.update_progress(
            job_id, "validating", 70, "Validating extraction quality..."
        )
        quality_score = metadata.get("quality_score", 0.0)

        if quality_score < 0.3:
            error_msg = (
                f"Low quality extraction (score: {quality_score:.2f}). "
                "File may be corrupted or unreadable."
            )
            logger.error(
                "quality_validation_failed",
                job_id=job_id,
                quality_score=quality_score,
            )
            await mark_job_failed(job_id, error_msg)
            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

        result_data = {
            "text": text,
            "metadata": metadata,
            "file_metadata": file_metadata,
        }

        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            db_result = await session.execute(stmt)
            job = db_result.scalar_one_or_none()
            if job:
                job.status = JobStatus.ANALYZING
                job.result = result_data
                await session.commit()

        self.update_progress(job_id, "parsing", 100, "Document parsed successfully!")
        logger.info(
            "document_processing_done",
            job_id=job_id,
            quality_score=quality_score,
        )
        return result_data

    try:
        return asyncio.run(_run())

    except ParsingError as e:
        logger.warning(
            "parse_failed_retrying",
            job_id=job_id,
            error=str(e),
            retry=self.request.retries,
        )
        self.update_progress(
            job_id,
            "extracting",
            25,
            f"Extraction failed, retrying... (attempt {self.request.retries + 1}/3)",
        )
        countdown = 60 * (2**self.request.retries)
        try:
            raise self.retry(exc=e, countdown=countdown)
        except MaxRetriesExceededError:
            error_msg = f"Failed to extract text after 3 attempts: {e!s}"
            logger.error(
                "max_retries_exceeded", job_id=job_id, error=error_msg, exc_info=True
            )
            asyncio.run(mark_job_failed(job_id, error_msg))
            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

    except Exception as e:
        error_msg = f"Unexpected error: {e!s}"
        logger.error("processing_error", job_id=job_id, error=error_msg, exc_info=True)
        asyncio.run(mark_job_failed(job_id, error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

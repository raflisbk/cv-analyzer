import asyncio
import json

import redis
from celery import Task
from celery.exceptions import MaxRetriesExceededError
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.services.parser import ParsingError, parse_document
from app.services.storage import storage_service
from app.tasks.celery_app import celery_app


redis_client = redis.from_url(
    celery_app.conf.broker_url.replace("redis://", "redis://")
)


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


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=60,
)
def process_document_task(self, job_id: str, file_id: str, file_metadata: dict):
    try:

        async def update_job_status(
            status: JobStatus, error: str | None = None, result: dict | None = None
        ):
            async with async_session_maker() as session:
                stmt = select(Job).where(Job.id == job_id)
                query_result = await session.execute(stmt)
                job = query_result.scalar_one_or_none()

                if job:
                    job.status = status
                    if error:
                        job.error = error
                    if result:
                        job.result = result
                    await session.commit()

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
            error_msg = f"Low quality extraction (score: {quality_score:.2f}). File may be corrupted or unreadable."
            logger.error(
                "quality_validation_failed",
                job_id=job_id,
                quality_score=quality_score,
            )
            asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

        self.update_progress(job_id, "parsing", 100, "Document parsed successfully!")

        result_data = {
            "text": text,
            "metadata": metadata,
            "file_metadata": file_metadata,
        }
        asyncio.run(update_job_status(JobStatus.ANALYZING, result=result_data))

        logger.info(
            "document_processing_done",
            job_id=job_id,
            quality_score=quality_score,
        )

        return result_data

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

            asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

    except Exception as e:
        error_msg = f"Unexpected error: {e!s}"
        logger.error("processing_error", job_id=job_id, error=error_msg, exc_info=True)

        asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

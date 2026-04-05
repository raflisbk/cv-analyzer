"""
Document processing Celery task
Implements D-13: SSE streams detailed stages
Implements D-16: Retry 3 times with exponential backoff
"""

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


# Redis client for progress updates
redis_client = redis.from_url(
    celery_app.conf.broker_url.replace("redis://", "redis://")
)


class ProgressTask(Task):
    """Base task class with progress update capability"""

    def update_progress(self, job_id: str, stage: str, percentage: int, message: str):
        """
        Emit progress update to Redis for SSE consumption per D-13

        Stages: uploading → extracting → validating → complete
        """
        progress_data = {
            "stage": stage,
            "percentage": percentage,
            "message": message,
            "job_id": job_id,
        }

        # Store in Redis with 1-hour TTL
        redis_client.setex(f"job:progress:{job_id}", 3600, json.dumps(progress_data))

        # Publish to channel for SSE streaming per D-14
        redis_client.publish(f"job:updates:{job_id}", json.dumps(progress_data))

        logger.info(
            "Progress update emitted",
            extra={"job_id": job_id, "stage": stage, "percentage": percentage},
        )


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,  # Per D-16
    default_retry_delay=60,  # Start with 1 minute
)
def process_document_task(self, job_id: str, file_id: str, file_metadata: dict):
    """
    Process uploaded document with progress updates

    Implements:
    - D-13: Detailed stage progression
    - D-16: 3 retries with exponential backoff
    - UPLOAD-03: Text extraction with quality validation
    - UPLOAD-04: OCR fallback
    - UPLOAD-06: Quality validation and error reporting

    Args:
        job_id: Job UUID
        file_id: R2 file identifier
        file_metadata: Dict with filename, mime_type, size, extension
    """

    try:
        # Update job status to extracting
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

        # Stage 1: Extracting (25%)
        self.update_progress(
            job_id, "extracting", 25, "Extracting text from document..."
        )

        # Retrieve file from R2
        file_content = storage_service.get_file(file_id)

        # Parse document (includes OCR fallback per D-08)
        text, metadata = parse_document(file_content, file_metadata["extension"])

        logger.info(
            "Document parsed successfully",
            extra={
                "job_id": job_id,
                "text_length": len(text),
                "extraction_method": metadata.get("extraction_method"),
                "quality_score": metadata.get("quality_score"),
            },
        )

        # Stage 2: Validating (70%)
        self.update_progress(
            job_id, "validating", 70, "Validating extraction quality..."
        )

        quality_score = metadata.get("quality_score", 0.0)

        if quality_score < 0.3:
            error_msg = f"Low quality extraction (score: {quality_score:.2f}). File may be corrupted or unreadable."
            logger.error(
                "Quality validation failed",
                extra={"job_id": job_id, "quality_score": quality_score},
            )

            # Update job as failed
            asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

        # Stage 3: Complete (100%)
        self.update_progress(job_id, "complete", 100, "Processing complete!")

        # Store results
        result_data = {
            "text": text,
            "metadata": metadata,
            "file_metadata": file_metadata,
        }

        asyncio.run(update_job_status(JobStatus.COMPLETE, result=result_data))

        logger.info(
            "Document processing complete",
            extra={"job_id": job_id, "quality_score": quality_score},
        )

        return result_data

    except ParsingError as e:
        # Parsing failed, retry per D-16
        logger.warning(
            "Parsing failed, retrying",
            extra={"job_id": job_id, "error": str(e), "retry": self.request.retries},
        )

        self.update_progress(
            job_id,
            "extracting",
            25,
            f"Extraction failed, retrying... (attempt {self.request.retries + 1}/3)",
        )

        # Exponential backoff: 60s, 120s, 240s
        countdown = 60 * (2**self.request.retries)

        try:
            raise self.retry(exc=e, countdown=countdown)
        except MaxRetriesExceededError:
            # All retries exhausted
            error_msg = f"Failed to extract text after 3 attempts: {e!s}"
            logger.error(
                "Max retries exceeded", extra={"job_id": job_id, "error": error_msg}
            )

            asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

            self.update_progress(job_id, "failed", 0, error_msg)
            return {"error": error_msg}

    except Exception as e:
        # Unexpected error
        error_msg = f"Unexpected error: {e!s}"
        logger.error(
            "Unexpected processing error", extra={"job_id": job_id, "error": error_msg}
        )

        asyncio.run(update_job_status(JobStatus.FAILED, error=error_msg))

        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}

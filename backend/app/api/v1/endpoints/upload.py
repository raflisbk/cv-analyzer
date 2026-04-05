"""
File upload endpoint
Implements UPLOAD-01: Upload PDF
Implements UPLOAD-02: Upload DOC/DOCX
Implements ERROR-01: Validate file type and size
"""

import uuid
from datetime import UTC, datetime

from celery import chain as celery_chain
from fastapi import APIRouter, Depends, UploadFile

from app.core.logging import structured_logger as logger
from app.core.security import FileValidationError, validate_file
from app.db.session import AsyncSession, get_db
from app.models.job import Job, JobStatus
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.upload import UploadResponse
from app.services.storage import storage_service
from app.tasks.document_processing import process_document_task
from app.tasks.grammar_check import grammar_check_task
from app.tasks.nlp_analysis import nlp_analyze_task
from app.tasks.scoring import score_cv_task


router = APIRouter()


@router.post("/upload", response_model=WrappedResponse[UploadResponse])
async def upload_file(file: UploadFile, db: AsyncSession = Depends(get_db)):
    """
    Upload CV file for analysis

    Accepts: PDF, DOC, DOCX files up to 5MB
    Returns: job_id for tracking processing status

    Process:
    1. Validate file (type, size, magic bytes) per ERROR-01
    2. Upload to R2 storage per UPLOAD-07
    3. Create job record per D-45
    4. Trigger async processing task per D-12
    5. Return job_id immediately (non-blocking)
    """
    request_id = str(uuid.uuid4())

    try:
        # Read file content
        content = await file.read()

        # Validate file per ERROR-01
        file_info = await validate_file(file.filename, content)

        logger.info(
            "File validation successful",
            extra={
                "filename": file.filename,
                "size": file_info["size"],
                "mime_type": file_info["mime_type"],
            },
        )

        # Upload to R2 storage
        file_id = storage_service.upload_file(
            content=content, original_filename=file.filename, metadata=file_info
        )

        # Create job record
        job = Job(
            status=JobStatus.UPLOADING,
            file_id=file_id,
            file_metadata={
                "filename": file.filename,
                "size": file_info["size"],
                "mime_type": file_info["mime_type"],
            },
        )

        db.add(job)
        await db.commit()
        await db.refresh(job)

        logger.info("Job created", extra={"job_id": str(job.id), "file_id": file_id})

        # Trigger 4-task analysis pipeline per D-17 (.si() = immutable signatures)
        pipeline = celery_chain(
            process_document_task.si(
                str(job.id),
                file_id,
                {
                    "filename": file.filename,
                    "mime_type": file_info["mime_type"],
                    "size": file_info["size"],
                    "extension": file_info["extension"],
                },
            ),
            nlp_analyze_task.si(str(job.id)),
            score_cv_task.si(str(job.id)),
            grammar_check_task.si(str(job.id)),
        )
        pipeline.delay()

        return WrappedResponse(
            data=UploadResponse(job_id=str(job.id)),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except FileValidationError as e:
        # Validation failed per ERROR-01
        logger.warning(
            "File validation failed",
            extra={
                "filename": file.filename,
                "error_code": e.code,
                "error_message": e.message,
            },
        )

        return WrappedResponse(
            error=ErrorDetail(code=e.code, message=e.message),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except Exception as e:
        logger.error(
            "Upload failed", extra={"filename": file.filename, "error": str(e)}
        )

        return WrappedResponse(
            error=ErrorDetail(
                code="UPLOAD_FAILED", message=f"File upload failed: {e!s}"
            ),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

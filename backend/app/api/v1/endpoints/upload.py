import uuid
from datetime import UTC, datetime

from celery import chain as celery_chain
from fastapi import APIRouter, Depends, Form, Request, UploadFile

from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.logging import structured_logger as logger
from app.core.security import FileValidationError, validate_file
from app.db.session import AsyncSession, get_db
from app.models.job import Job, JobStatus
from app.models.user import User
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.upload import UploadResponse
from app.services.storage import storage_service
from app.tasks.document_processing import process_document_task
from app.tasks.grammar_check import grammar_check_task
from app.tasks.llm_suggest import llm_suggest_task
from app.tasks.nlp_analysis import nlp_analyze_task
from app.tasks.scoring import score_cv_task

settings = get_settings()

router = APIRouter()


@router.post("/upload", response_model=WrappedResponse[UploadResponse])
@limiter.limit(settings.CV_ANALYZER_UPLOAD_RATE_LIMIT)
async def upload_file(
    request: Request,
    file: UploadFile,
    jd_text: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    request_id = str(uuid.uuid4())

    try:

        content = await file.read()

        file_info = await validate_file(file.filename, content)

        logger.info(
            "file_validation_passed",
            filename=file.filename,
            size=file_info["size"],
            mime_type=file_info["mime_type"],
        )

        file_id = storage_service.upload_file(
            content=content, original_filename=file.filename, metadata=file_info
        )

        job = Job(
            status=JobStatus.UPLOADING,
            file_id=file_id,
            file_metadata={
                "filename": file.filename,
                "size": file_info["size"],
                "mime_type": file_info["mime_type"],
            },
            jd_text=jd_text.strip() if jd_text and jd_text.strip() else None,
            user_id=current_user.id if current_user else None,
        )

        db.add(job)
        await db.commit()
        await db.refresh(job)

        logger.info("job_created", job_id=str(job.id), file_id=file_id)

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
            llm_suggest_task.si(str(job.id)),
        )
        pipeline.delay()

        return WrappedResponse(
            data=UploadResponse(job_id=str(job.id)),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except FileValidationError as e:

        logger.warning(
            "file_validation_failed",
            filename=file.filename,
            error_code=e.code,
            error_message=e.message,
        )

        return WrappedResponse(
            error=ErrorDetail(code=e.code, message=e.message),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except Exception as e:
        logger.error(
            "upload_failed", filename=file.filename, error=str(e), exc_info=True
        )

        return WrappedResponse(
            error=ErrorDetail(
                code="UPLOAD_FAILED", message=f"File upload failed: {e!s}"
            ),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

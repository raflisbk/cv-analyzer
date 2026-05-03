import uuid
from datetime import UTC, datetime
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.job import JobResponse
from app.services.storage import StorageError, storage_service

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=WrappedResponse[JobResponse])
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    request_id = str(uuid.uuid4())

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND", message=f"Job {job_id} not found"
                ),
                meta=ResponseMeta(
                    request_id=request_id, timestamp=datetime.now(UTC).isoformat()
                ),
            )

        return WrappedResponse(
            data=JobResponse.model_validate(job),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except Exception as e:
        return WrappedResponse(
            error=ErrorDetail(code="QUERY_FAILED", message=str(e)),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )


@router.get(
    "/jobs/{job_id}/file/proxy",
    summary="Stream PDF file directly (avoids CORS issues)",
    tags=["jobs"],
)
async def proxy_job_file(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND",
                    message=f"Job {job_id} not found.",
                ),
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            )

        if not job.file_id:
            return WrappedResponse(
                error=ErrorDetail(
                    code="FILE_NOT_FOUND",
                    message="CV file not available for this job.",
                ),
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            )

        file_content = storage_service.get_file(job.file_id)

        return StreamingResponse(
            BytesIO(file_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{job.file_id}"',
                "Cache-Control": "public, max-age=3600",
            },
        )

    except StorageError as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_FETCH_FAILED",
                message=f"Failed to fetch file: {exc!s}",
            ),
            meta=ResponseMeta(
                request_id=str(uuid.uuid4()), timestamp=datetime.now(UTC).isoformat()
            ),
        )
    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_FETCH_FAILED",
                message=f"Failed to fetch file: {exc!s}",
            ),
            meta=ResponseMeta(
                request_id=str(uuid.uuid4()), timestamp=datetime.now(UTC).isoformat()
            ),
        )

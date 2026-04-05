"""Job status endpoint"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.job import JobResponse


router = APIRouter()


@router.get("/jobs/{job_id}", response_model=WrappedResponse[JobResponse])
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get job status and results
    Implements D-14: Job status tracked via job ID with polling endpoint
    """
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

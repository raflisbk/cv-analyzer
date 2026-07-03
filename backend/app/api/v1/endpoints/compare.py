import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy import select

from app.api.dependencies import check_job_access, get_current_user
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.models.job_role import JobRole as JobRoleModel
from app.models.user import User
from app.schemas.analysis import JobRole
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.tasks.comparison import compare_cv_task

router = APIRouter()

_JD_MIN_LENGTH = 50


class CompareRequest(BaseModel):
    jd_text: str
    jd_role_id: str | None = None

    @field_validator("jd_text")
    @classmethod
    def jd_text_min_length(cls, v: str) -> str:
        if len(v.strip()) < _JD_MIN_LENGTH:
            msg = "Job description must be at least 50 characters"
            raise ValueError(msg)
        return v


class CompareResponse(BaseModel):
    job_id: str
    message: str
    comparison_status: str


@router.get(
    "/job-roles",
    response_model=WrappedResponse[list[JobRole]],
    summary="List available job roles for comparison",
)
async def list_job_roles(
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[list[JobRole]]:
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(JobRoleModel).order_by(JobRoleModel.title, JobRoleModel.seniority)
        result = await db.execute(stmt)
        roles = result.scalars().all()

        return WrappedResponse(
            data=[
                JobRole(
                    id=str(role.id),
                    title=role.title,
                    seniority=role.seniority,
                    industry=role.industry,
                )
                for role in roles
            ],
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
    except Exception as exc:
        logger.error("job_roles_fetch_failed", exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(code="JOB_ROLES_FETCH_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.post(
    "/jobs/{job_id}/compare",
    response_model=WrappedResponse[CompareResponse],
    summary="Trigger CV vs job description comparison",
)
async def compare_cv(
    job_id: str,
    body: CompareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
) -> WrappedResponse[CompareResponse]:
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND", message=f"Job {job_id} not found."
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        check_job_access(job, current_user)

        job.comparison_status = "pending"
        await db.commit()

        compare_cv_task.delay(
            job_id=str(job.id),
            jd_text=body.jd_text,
            jd_role_id=body.jd_role_id,
        )

        return WrappedResponse(
            data=CompareResponse(
                job_id=str(job.id),
                message="Comparison started. Listen to SSE stream for progress.",
                comparison_status="pending",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
    except Exception as exc:
        logger.error("compare_trigger_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(code="COMPARE_TRIGGER_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

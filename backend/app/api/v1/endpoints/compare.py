"""
Comparison endpoints per D-C1, D-C5.
GET /job-roles — list seeded job roles for comparison dropdown (COMPARE-02)
POST /jobs/{job_id}/compare — trigger async CV vs JD comparison task (COMPARE-01)
"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.models.job_role import JobRole as JobRoleModel
from app.schemas.analysis import JobRole
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.tasks.comparison import compare_cv_task


router = APIRouter()

# ─── Constants ────────────────────────────────────────────────────────────────

_JD_MIN_LENGTH = 50  # Minimum job description length per D-C1


class CompareRequest(BaseModel):
    """POST /jobs/{id}/compare request body per D-C1, COMPARE-01."""

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
    """POST /jobs/{id}/compare response."""

    job_id: str
    message: str
    comparison_status: str


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get(
    "/job-roles",
    response_model=WrappedResponse[list[JobRole]],
    summary="List available job roles for comparison",
)
async def list_job_roles(
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[list[JobRole]]:
    """
    Get all pre-seeded job roles for the comparison dropdown per D-C5, COMPARE-02.
    Returns {id, title, seniority, industry} — description/requirements excluded for bandwidth.
    """
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(JobRoleModel).order_by(JobRoleModel.title, JobRoleModel.seniority)
        result = await db.execute(stmt)
        roles = result.scalars().all()

        role_list = [
            JobRole(
                id=str(role.id),
                title=role.title,
                seniority=role.seniority,
                industry=role.industry,
            )
            for role in roles
        ]

        return WrappedResponse(
            data=role_list,
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
    except Exception as e:
        return WrappedResponse(
            error=ErrorDetail(code="JOB_ROLES_FETCH_FAILED", message=str(e)),
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
) -> WrappedResponse[CompareResponse]:
    """
    Trigger async CV comparison task per D-C1, COMPARE-01.

    Validates: job exists, jd_text >= 50 chars (validated by CompareRequest).
    Triggers: compare_cv_task.delay() with job_id, jd_text, jd_role_id.
    Progress: emits 'comparing_job' SSE stage via existing /stream/{job_id} channel.
    Note: Re-triggering overwrites previous comparison result (D-C10).
    """
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

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
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        # Set comparison_status = pending immediately (before Celery task picks it up)
        job.comparison_status = "pending"
        await db.commit()

        # Dispatch Celery task per D-C1 (non-blocking)
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
    except Exception as e:
        return WrappedResponse(
            error=ErrorDetail(code="COMPARE_TRIGGER_FAILED", message=str(e)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

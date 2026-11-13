from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.common import ErrorDetail, WrappedResponse
from app.schemas.job_match import JobMatchData, JobMatchRequest
from app.services.job_match.extractor import JobMatchError
from app.services.job_match.matcher import match_job

router = APIRouter()


async def rate_user(request: Request, user: User = Depends(require_user)) -> User:
    request.state.job_match_user_id = str(user.id)
    return user


@router.post(
    "/jobs/{job_id}/job-match",
    response_model=WrappedResponse[JobMatchData],
    response_model_by_alias=True,
)
@limiter.limit("10/minute", key_func=lambda request: request.state.job_match_user_id)
async def job_match(
    request: Request,
    job_id: UUID,
    body: JobMatchRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(rate_user),
) -> WrappedResponse[JobMatchData]:
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    )
    job = result.scalar_one_or_none()
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found.")
    cv_text = (job.result or {}).get("text") or ""
    try:
        data = match_job(str(job_id), body.job_description, cv_text, job.nlp_result)
        return WrappedResponse(data=data)
    except JobMatchError:
        return WrappedResponse(
            error=ErrorDetail(
                code="JOB_MATCH_FAILED",
                message="Unable to analyze this job description.",
            )
        )

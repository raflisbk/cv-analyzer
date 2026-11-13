import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.common import WrappedResponse
from app.schemas.report_detail import ReportDetail, VersionData, VersionDiff
from app.services.report_detail.assemble import report_detail
from app.services.versions_view.chain import versions
from app.services.versions_view.diff import version_diff

router = APIRouter()


async def owned_chain(
    db: AsyncSession, user: User, job_id: uuid.UUID
) -> tuple[Job, dict]:
    result = await db.execute(select(Job).where(Job.user_id == user.id))
    jobs = [job for job in result.scalars().all() if job.user_id == user.id]
    jobs_by_id = {job.id: job for job in jobs}
    job = jobs_by_id.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job, jobs_by_id


@router.get(
    "/jobs/{job_id}/report",
    response_model=WrappedResponse[ReportDetail],
    response_model_by_alias=True,
)
async def get_report_detail(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[ReportDetail]:
    job, jobs_by_id = await owned_chain(db, user, job_id)
    return WrappedResponse(data=report_detail(job, jobs_by_id))


@router.get(
    "/jobs/{job_id}/versions",
    response_model=WrappedResponse[list[VersionData]],
    response_model_by_alias=True,
)
async def get_versions(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[list[VersionData]]:
    job, jobs_by_id = await owned_chain(db, user, job_id)
    return WrappedResponse(data=versions(job, jobs_by_id))


@router.get(
    "/jobs/{job_id}/versions/{version_id}/diff",
    response_model=WrappedResponse[VersionDiff],
    response_model_by_alias=True,
)
async def get_version_diff(
    job_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[VersionDiff]:
    job, jobs_by_id = await owned_chain(db, user, job_id)
    history = versions(job, jobs_by_id)
    if str(version_id) not in {item.id for item in history}:
        raise HTTPException(status_code=404, detail="Version not found")
    selected = jobs_by_id[version_id]
    previous = jobs_by_id.get(selected.parent_job_id)
    return WrappedResponse(data=version_diff(selected, previous))

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.app_lists import CvSummary, ReportsData
from app.schemas.common import WrappedResponse
from app.services.app_lists.cv_summaries import cv_summaries
from app.services.app_lists.report_aggregate import report_aggregate
from app.services.app_lists.report_summaries import report_summaries

router = APIRouter()


async def owner_jobs(db: AsyncSession, user: User) -> list[Job]:
    result = await db.execute(
        select(Job).where(Job.user_id == user.id).order_by(Job.updated_at.desc())
    )
    return [job for job in result.scalars().all() if job.user_id == user.id]


@router.get(
    "/cvs",
    response_model=WrappedResponse[list[CvSummary]],
    response_model_by_alias=True,
)
async def get_cvs(
    db: AsyncSession = Depends(get_db), user: User = Depends(require_user)
) -> WrappedResponse[list[CvSummary]]:
    return WrappedResponse(data=cv_summaries(await owner_jobs(db, user)))


@router.get(
    "/reports",
    response_model=WrappedResponse[ReportsData],
    response_model_by_alias=True,
)
async def get_reports(
    db: AsyncSession = Depends(get_db), user: User = Depends(require_user)
) -> WrappedResponse[ReportsData]:
    jobs = await owner_jobs(db, user)
    reports = report_summaries(jobs)
    return WrappedResponse(
        data=ReportsData(reports=reports, aggregate=report_aggregate(reports, jobs))
    )

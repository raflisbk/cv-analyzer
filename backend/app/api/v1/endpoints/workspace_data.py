from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.common import WrappedResponse
from app.schemas.workspace_data import AtsData, GrammarData
from app.services.workspace_data.ats_view import ats_data
from app.services.workspace_data.grammar_decisions import decide_issue
from app.services.workspace_data.grammar_view import grammar_data

router = APIRouter()


async def owned_job(job_id: UUID, db: AsyncSession, user: User) -> Job:
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    )
    job = result.scalar_one_or_none()
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


@router.get(
    "/jobs/{job_id}/ats",
    response_model=WrappedResponse[AtsData],
    response_model_by_alias=True,
)
async def get_ats(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[AtsData]:
    return WrappedResponse(data=ats_data(await owned_job(job_id, db, user)))


@router.get(
    "/jobs/{job_id}/grammar",
    response_model=WrappedResponse[GrammarData],
    response_model_by_alias=True,
)
async def get_grammar(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[GrammarData]:
    return WrappedResponse(data=grammar_data(await owned_job(job_id, db, user)))


async def resolve_note(
    job_id: UUID, note_id: str, action: str, db: AsyncSession, user: User
) -> WrappedResponse[GrammarData]:
    job = await owned_job(job_id, db, user)
    decide_issue(job, note_id, action)
    await db.commit()
    return WrappedResponse(data=grammar_data(job))


@router.post(
    "/jobs/{job_id}/grammar/{note_id}/accept",
    response_model=WrappedResponse[GrammarData],
    response_model_by_alias=True,
)
async def accept_grammar(
    job_id: UUID,
    note_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[GrammarData]:
    return await resolve_note(job_id, note_id, "accept", db, user)


@router.post(
    "/jobs/{job_id}/grammar/{note_id}/ignore",
    response_model=WrappedResponse[GrammarData],
    response_model_by_alias=True,
)
async def ignore_grammar(
    job_id: UUID,
    note_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[GrammarData]:
    return await resolve_note(job_id, note_id, "ignore", db, user)

import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job
from app.services.versions_restore.chain import MAX_CHAIN_LENGTH, full_chain
from app.services.versions_restore.copy import restored_job


async def restore_version(
    db: AsyncSession, job: Job, version_id: uuid.UUID, jobs_by_id: dict
) -> tuple[Job, str]:
    chain = full_chain(job, jobs_by_id)
    target = next((item for item in chain if item.id == version_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Version not found")
    if target is chain[-1]:
        raise HTTPException(status_code=409, detail="Version is already the latest")
    if len(chain) >= MAX_CHAIN_LENGTH:
        raise HTTPException(status_code=409, detail="Version limit reached")
    created = restored_job(target, chain[-1])
    created.id = uuid.uuid4()
    db.add(created)
    await db.commit()
    return created, f"v{len(chain) + 1}"

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.api.v1.endpoints.report_detail import owned_chain
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import WrappedResponse
from app.schemas.versions_restore import RestoredVersion
from app.services.versions_restore.restore import restore_version

router = APIRouter()


@router.post(
    "/jobs/{job_id}/versions/{version_id}/restore",
    response_model=WrappedResponse[RestoredVersion],
    response_model_by_alias=True,
)
async def restore_job_version(
    job_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[RestoredVersion]:
    """Adds a new latest version holding the chosen version's content."""
    job, jobs_by_id = await owned_chain(db, user, job_id)
    created, label = await restore_version(db, job, version_id, jobs_by_id)
    return WrappedResponse(data=RestoredVersion(job_id=str(created.id), version=label))

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.inline_edit import InlineEditRequest, InlineEditResponse
from app.services.llm.inline_edit_service import InlineEditService


router = APIRouter()


def _build_cv_context(job: Job) -> dict[str, Any] | None:
    if not job.result:
        return None
    result = job.result
    return {
        "scores": result.get("scores"),
        "skills": result.get("skills", [])[:10],
        "suggestions_count": len(result.get("suggestions", [])),
    }


@router.post(
    "/jobs/{job_id}/inline-edit", response_model=WrappedResponse[InlineEditResponse]
)
async def inline_edit(
    job_id: str,
    request: InlineEditRequest,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[InlineEditResponse]:
    request_id = f"inline-edit-{uuid.uuid4().hex[:16]}"
    timestamp = datetime.now(UTC).isoformat()

    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        return WrappedResponse(
            error=ErrorDetail(code="NOT_FOUND", message=f"Job {job_id} not found."),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    cv_context = _build_cv_context(job)

    service = InlineEditService()
    response = service.rewrite(
        selected_text=request.selectedText,
        prompt=request.prompt,
        cv_context=cv_context,
    )

    return WrappedResponse(
        data=response,
        meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
    )

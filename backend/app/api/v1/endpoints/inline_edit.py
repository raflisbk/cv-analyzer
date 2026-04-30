"""Inline edit endpoint."""

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ResponseMeta, WrappedResponse
from app.schemas.inline_edit import InlineEditRequest, InlineEditResponse
from app.services.llm.inline_edit_service import InlineEditService


router = APIRouter()


def _generate_request_id() -> str:
    """Generate unique request ID for tracing."""
    return f"inline-edit-{uuid.uuid4().hex[:16]}"


def _build_cv_context(job: Job) -> dict[str, Any] | None:
    """Extract CV context from job result for LLM prompting."""
    if not job.result:
        return None

    result = job.result

    return {
        "scores": result.get("scores"),
        "skills": result.get("skills", [])[:10],  # Top 10 skills
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
    """
    Generate AI rewrite for selected CV text.

    Args:
        job_id: Job UUID
        request: Inline edit request with selected text and prompt

    Returns:
        WrappedResponse containing InlineEditResponse with rewritten text

    Raises:
        HTTPException: If job not found
    """
    request_id = _generate_request_id()
    timestamp = datetime.now(UTC).isoformat()

    # Validate job exists
    result = await db.execute(select(Job).where(Job.job_id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    # Build CV context for LLM
    cv_context = _build_cv_context(job)

    # Call inline edit service
    service = InlineEditService()
    response = service.rewrite(
        selected_text=request.selectedText,
        prompt=request.prompt,
        cv_context=cv_context,
    )

    # Return wrapped response
    return WrappedResponse(
        data=response,
        meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
    )

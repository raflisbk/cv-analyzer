import asyncio
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.db.session import AsyncSession, async_session_maker, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.inline_edit import InlineEditRequest, InlineEditResponse
from app.services.llm.inline_edit_service import InlineEditService
from app.services.memory.indexer import index_edit
from app.services.memory.retriever import retrieve_job_memory

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
    cv_text = job.result.get("text") if job.result else None
    user_id = str(job.user_id) if job.user_id else None

    memory_chunks = await retrieve_job_memory(
        job_id, f"{request.selectedText} {request.prompt}", limit=3
    )

    service = InlineEditService()
    response = service.rewrite(
        selected_text=request.selectedText,
        prompt=request.prompt,
        cv_context=cv_context,
        cv_text=cv_text,
        memory_chunks=memory_chunks,
    )

    if not response.error:
        asyncio.ensure_future(
            _index_edit_fire_and_forget(
                job_id, user_id, response.originalText, response.rewrittenText
            )
        )

    return WrappedResponse(
        data=response,
        meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
    )


async def _index_edit_fire_and_forget(
    job_id: str, user_id: str | None, original_text: str, rewritten_text: str
) -> None:
    async with async_session_maker() as session:
        await index_edit(job_id, user_id, original_text, rewritten_text, session)

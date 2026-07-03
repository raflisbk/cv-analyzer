import asyncio
import json
from collections.abc import AsyncGenerator
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.api.dependencies import check_job_access, get_current_user
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, async_session_maker, get_db
from app.models.job import Job
from app.models.user import User
from app.services.llm.chat_context_builder import build_chat_system_prompt

router = APIRouter()


async def _save_messages(job_id: str, messages: list[dict]) -> None:
    async with async_session_maker() as db:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.messages = messages
            await db.commit()
            logger.info(
                "chat_messages_saved",
                job_id=job_id,
                message_count=len(messages),
            )


async def _stream_mock_response(user_message: str) -> AsyncGenerator[str]:
    response = (
        f"I understand you're asking about: {user_message}. "
        "This is a mock response — actual LLM streaming will be implemented "
        "when HF InferenceClient supports it."
    )
    for char in response:
        await asyncio.sleep(0.02)
        yield char


@router.post("/jobs/{job_id}/chat")
async def chat_stream(
    job_id: str,
    message: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job_check = result.scalar_one_or_none()
    if not job_check:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    check_job_access(job_check, current_user)

    async def stream_chat_response() -> AsyncGenerator[str]:
        async with async_session_maker() as session:
            row = await session.execute(select(Job).where(Job.id == job_id))
            job = row.scalar_one_or_none()

        if not job:
            yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
            return

        _system_prompt = build_chat_system_prompt(job)

        messages = list(job.messages) if job.messages else []

        user_msg = {
            "timestamp": datetime.now(UTC).isoformat(),
            "role": "user",
            "content": message,
            "status": "complete",
        }
        messages.append(user_msg)

        assistant_msg = {
            "timestamp": datetime.now(UTC).isoformat(),
            "role": "assistant",
            "content": "",
            "status": "streaming",
        }
        messages.append(assistant_msg)

        yield f"data: {json.dumps({'type': 'connected', 'job_id': job_id})}\n\n"

        try:

            assistant_content: list[str] = []
            async for token in _stream_mock_response(message):
                assistant_content.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            assistant_msg["content"] = "".join(assistant_content)
            assistant_msg["status"] = "complete"
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

            await _save_messages(job_id, messages)

        except Exception as e:
            logger.error(
                "chat_stream_failed", job_id=job_id, error=str(e), exc_info=True
            )
            assistant_msg["status"] = "error"
            assistant_msg["content"] = (
                "I couldn't generate a response. Please try again."
            )
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        stream_chat_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

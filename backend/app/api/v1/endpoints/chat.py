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
from app.services.llm.koboi_llm_service import KoboiLLMService
from app.services.memory.indexer import index_chat_message
from app.services.memory.retriever import retrieve_job_memory

router = APIRouter()
_llm_service = KoboiLLMService()


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


async def _index_chat_turn(
    job_id: str, user_id: str | None, user_message: str, assistant_message: str
) -> None:
    async with async_session_maker() as session:
        await index_chat_message(job_id, user_id, "user", user_message, session)
        await index_chat_message(
            job_id, user_id, "assistant", assistant_message, session
        )


async def _stream_llm_response(
    system_prompt: str, history: list[dict]
) -> AsyncGenerator[str]:
    """Collects the full LLM response off-thread (sync SDK), then replays it as a
    stream. Not true token-by-token real-time, but keeps the event loop unblocked.
    """

    def _collect() -> list[str]:
        return list(_llm_service.chat_stream(system_prompt, history))

    tokens = await asyncio.to_thread(_collect)
    for token in tokens:
        yield token


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

        user_id = str(job.user_id) if job.user_id else None
        memory_chunks = await retrieve_job_memory(job_id, message, limit=5)
        _system_prompt = build_chat_system_prompt(job, memory_chunks)

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

        history = [
            {"role": m["role"], "content": m["content"]}
            for m in messages[:-1]
            if m.get("status") == "complete"
        ]

        try:

            assistant_content: list[str] = []
            async for token in _stream_llm_response(_system_prompt, history):
                assistant_content.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            assistant_msg["content"] = "".join(assistant_content)
            assistant_msg["status"] = "complete"
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

            await _save_messages(job_id, messages)

            asyncio.ensure_future(
                _index_chat_turn(job_id, user_id, message, assistant_msg["content"])
            )

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

"""SSE streaming chat endpoint for contextual CV assistant."""

import asyncio
import json
from collections.abc import AsyncGenerator
from datetime import UTC, datetime

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job
from app.services.llm.chat_context_builder import build_chat_system_prompt


router = APIRouter()


async def _save_messages(job_id: str, messages: list[dict]) -> None:
    """Background task to save chat messages to database."""
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
    """Mock LLM streaming response.

    NOTE: Replace with actual HF InferenceClient streaming when available.
    HFOpenAILLMService.generate_suggestions_stream raises NotImplementedError.
    """
    response = (
        f"I understand you're asking about: {user_message}. "
        "This is a mock response — actual LLM streaming will be implemented "
        "when HF InferenceClient supports it."
    )
    for char in response:
        await asyncio.sleep(0.02)
        yield char


@router.post("/jobs/{job_id}/chat")
async def chat_stream(job_id: str, message: str):
    """Stream chat responses via SSE.

    Request body: { "message": "user question" }
    Response: text/event-stream with token chunks

    Flow:
    1. Validate job exists
    2. Build system prompt with full analysis context
    3. Stream LLM response token-by-token
    4. Save both user and assistant messages to Job.messages
    """

    async def stream_chat_response() -> AsyncGenerator[str]:
        async with async_session_maker() as db:
            result = await db.execute(select(Job).where(Job.id == job_id))
            job = result.scalar_one_or_none()

        if not job:
            yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
            return

        # Build system prompt with full context
        system_prompt = build_chat_system_prompt(job)

        # Prepare messages array
        messages = list(job.messages) if job.messages else []

        # Add user message
        user_msg = {
            "timestamp": datetime.now(UTC).isoformat(),
            "role": "user",
            "content": message,
            "status": "complete",
        }
        messages.append(user_msg)

        # Add placeholder for assistant message
        assistant_msg = {
            "timestamp": datetime.now(UTC).isoformat(),
            "role": "assistant",
            "content": "",
            "status": "streaming",
        }
        messages.append(assistant_msg)

        # Send connected event
        yield f"data: {json.dumps({'type': 'connected', 'job_id': job_id})}\n\n"

        try:
            # Stream LLM response (mock for now)
            assistant_content: list[str] = []
            async for token in _stream_mock_response(message):
                assistant_content.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            # Mark complete
            assistant_msg["content"] = "".join(assistant_content)
            assistant_msg["status"] = "complete"
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

            # Save messages in background
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

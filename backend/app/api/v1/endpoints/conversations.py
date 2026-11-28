import asyncio
import json
from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.api.dependencies import require_user
from app.db.session import AsyncSession, async_session_maker, get_db
from app.models.user import User
from app.schemas.common import WrappedResponse
from app.schemas.conversations import (
    ChatMessage,
    ConversationSummary,
    CreateConversation,
    DeletedConversation,
    SendMessage,
    UpdateConversation,
)
from app.services.chat_stream.bridge import stream_in_thread
from app.services.chat_stream.context import build_context
from app.services.chat_stream.manage import (
    restore_conversation,
    search_conversations,
    soft_delete_conversation,
    update_conversation,
)
from app.services.chat_stream.store import (
    create_conversation,
    list_conversations,
    list_messages,
    owned_conversation,
    save_assistant_message,
    save_user_message,
)
from app.services.llm.koboi_llm_service import KoboiLLMService

router = APIRouter()


def event(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@router.get(
    "",
    response_model=WrappedResponse[list[ConversationSummary]],
    response_model_exclude_unset=True,
)
async def get_conversations(
    q: str | None = Query(default=None, max_length=80),
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[list[ConversationSummary]]:
    query = (q or "").strip()
    if query:
        return WrappedResponse(data=await search_conversations(db, user.id, query))
    return WrappedResponse(data=await list_conversations(db, user.id))


@router.post("", response_model=WrappedResponse[ConversationSummary])
async def post_conversation(
    body: CreateConversation,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[ConversationSummary]:
    return WrappedResponse(data=await create_conversation(db, user.id, body.jobId))


@router.patch(
    "/{conversation_id}",
    response_model=WrappedResponse[ConversationSummary],
    response_model_exclude_unset=True,
)
async def patch_conversation(
    conversation_id: UUID,
    body: UpdateConversation,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[ConversationSummary]:
    return WrappedResponse(
        data=await update_conversation(db, user.id, conversation_id, body)
    )


@router.delete(
    "/{conversation_id}", response_model=WrappedResponse[DeletedConversation]
)
async def delete_conversation(
    conversation_id: UUID,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[DeletedConversation]:
    return WrappedResponse(
        data=await soft_delete_conversation(db, user.id, conversation_id)
    )


@router.post(
    "/{conversation_id}/restore",
    response_model=WrappedResponse[ConversationSummary],
    response_model_exclude_unset=True,
)
async def post_restore_conversation(
    conversation_id: UUID,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[ConversationSummary]:
    return WrappedResponse(
        data=await restore_conversation(db, user.id, conversation_id)
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[ChatMessage],
    response_model_exclude_none=True,
)
async def get_messages(
    conversation_id: UUID,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChatMessage]:
    conversation = await owned_conversation(db, user.id, conversation_id)
    return await list_messages(db, conversation.id)


@router.post("/{conversation_id}/messages")
async def post_message(
    conversation_id: UUID,
    body: SendMessage,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    conversation = await owned_conversation(db, user.id, conversation_id)
    await save_user_message(db, conversation, body.text)

    async def stream() -> AsyncGenerator[str]:
        try:
            async with async_session_maker() as session:
                prompt, history = await build_context(
                    session, conversation, user.id, body.text
                )
            service = KoboiLLMService()
            chunks: list[str] = []
            async with asyncio.timeout(60):
                async for chunk in stream_in_thread(
                    lambda: service.chat_stream(prompt, history)
                ):
                    chunks.append(chunk)
                    yield event({"token": chunk})
            answer = "".join(chunks)
            async with async_session_maker() as session:
                await save_assistant_message(session, conversation.id, answer)
            yield event({"type": "complete", "text": answer, "actions": []})
        except Exception:
            yield event({"error": "Could not complete your message."})

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

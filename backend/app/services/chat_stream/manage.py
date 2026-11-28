from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import exists, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job
from app.schemas.conversations import (
    ConversationSummary,
    DeletedConversation,
    UpdateConversation,
)
from app.services.chat_stream.store import LIST_ORDER, owned_conversation, summary

SEARCH_LIMIT = 50
SNIPPET_LENGTH = 120


def retention() -> timedelta:
    return timedelta(hours=get_settings().CV_ANALYZER_CONVERSATION_UNDO_HOURS)


def escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def build_snippet(text: str, query: str) -> str:
    flat = " ".join(text.split())
    index = max(flat.lower().find(query.lower()), 0)
    start = max(0, index - (SNIPPET_LENGTH - len(query)) // 2)
    return flat[start : start + SNIPPET_LENGTH]


async def summary_by_id(
    db: AsyncSession, user_id: UUID, conversation_id: UUID
) -> ConversationSummary:
    result = await db.execute(
        select(Conversation, Job)
        .outerjoin(Job, Conversation.job_id == Job.id)
        .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .execution_options(populate_existing=True)
    )
    conversation, job = result.one()
    return summary(conversation, job)


async def update_conversation(
    db: AsyncSession, user_id: UUID, conversation_id: UUID, body: UpdateConversation
) -> ConversationSummary:
    conversation = await owned_conversation(db, user_id, conversation_id)
    changes: dict = {"updated_at": Conversation.updated_at}
    if body.title is not None:
        changes["title"] = body.title
    if body.pinned is not None and body.pinned != bool(conversation.pinned):
        changes["pinned"] = body.pinned
        changes["pinned_at"] = datetime.now(UTC) if body.pinned else None
    await db.execute(
        update(Conversation).where(Conversation.id == conversation.id).values(changes)
    )
    await db.commit()
    return await summary_by_id(db, user_id, conversation.id)


async def find_owned_including_deleted(
    db: AsyncSession, user_id: UUID, conversation_id: UUID
) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conversation


def deleted_payload(conversation: Conversation) -> DeletedConversation:
    return DeletedConversation(
        id=str(conversation.id),
        deletedAt=conversation.deleted_at,
        restoreUntil=conversation.deleted_at + retention(),
    )


async def soft_delete_conversation(
    db: AsyncSession, user_id: UUID, conversation_id: UUID
) -> DeletedConversation:
    conversation = await find_owned_including_deleted(db, user_id, conversation_id)
    now = datetime.now(UTC)
    if conversation.deleted_at is None:
        await db.execute(
            update(Conversation)
            .where(Conversation.id == conversation.id)
            .values(deleted_at=now, updated_at=Conversation.updated_at)
        )
        await db.commit()
        await db.refresh(conversation)
    elif now - conversation.deleted_at >= retention():
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return deleted_payload(conversation)


async def restore_conversation(
    db: AsyncSession, user_id: UUID, conversation_id: UUID
) -> ConversationSummary:
    conversation = await find_owned_including_deleted(db, user_id, conversation_id)
    if conversation.deleted_at is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if datetime.now(UTC) - conversation.deleted_at >= retention():
        raise HTTPException(status_code=410, detail="Restore window has passed.")
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation.id)
        .values(deleted_at=None, updated_at=Conversation.updated_at)
    )
    await db.commit()
    return await summary_by_id(db, user_id, conversation.id)


async def first_message_matches(
    db: AsyncSession, conversation_ids: list[UUID], pattern: str
) -> dict[UUID, str]:
    result = await db.execute(
        select(ConversationMessage.conversation_id, ConversationMessage.text)
        .where(
            ConversationMessage.conversation_id.in_(conversation_ids),
            ConversationMessage.text.ilike(pattern, escape="\\"),
        )
        .distinct(ConversationMessage.conversation_id)
        .order_by(
            ConversationMessage.conversation_id,
            ConversationMessage.created_at,
            ConversationMessage.id,
        )
    )
    return dict(result.all())


async def search_conversations(
    db: AsyncSession, user_id: UUID, query: str
) -> list[ConversationSummary]:
    pattern = f"%{escape_like(query)}%"
    message_match = exists().where(
        ConversationMessage.conversation_id == Conversation.id,
        ConversationMessage.text.ilike(pattern, escape="\\"),
    )
    result = await db.execute(
        select(Conversation, Job)
        .outerjoin(Job, Conversation.job_id == Job.id)
        .where(
            Conversation.user_id == user_id,
            Conversation.deleted_at.is_(None),
            Conversation.title.ilike(pattern, escape="\\") | message_match,
        )
        .order_by(*LIST_ORDER)
        .limit(SEARCH_LIMIT)
    )
    rows = result.all()
    body_matches = [c.id for c, _ in rows if query.lower() not in c.title.lower()]
    texts = (
        await first_message_matches(db, body_matches, pattern) if body_matches else {}
    )
    results = []
    for conversation, job in rows:
        item = summary(conversation, job)
        text = texts.get(conversation.id)
        item.snippet = build_snippet(text, query) if text else None
        results.append(item)
    return results

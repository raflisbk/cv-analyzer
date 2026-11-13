from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job
from app.schemas.conversations import (
    ChatMessage,
    ConversationSummary,
    CvScope,
    GeneralScope,
)


async def owned_conversation(
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


async def owned_job(db: AsyncSession, user_id: UUID, job_id: UUID) -> Job:
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user_id)
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


def summary(conversation: Conversation, job: Job | None) -> ConversationSummary:
    scope = (
        CvScope(jobId=str(job.id), fileName=job.file_metadata.get("filename", "CV"))
        if job
        else GeneralScope()
    )
    return ConversationSummary(
        id=str(conversation.id),
        title=conversation.title,
        scope=scope,
        updatedAt=conversation.updated_at,
    )


async def list_conversations(
    db: AsyncSession, user_id: UUID
) -> list[ConversationSummary]:
    result = await db.execute(
        select(Conversation, Job)
        .outerjoin(Job, Conversation.job_id == Job.id)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .limit(100)
    )
    return [summary(conversation, job) for conversation, job in result.all()]


async def create_conversation(
    db: AsyncSession, user_id: UUID, job_id: UUID | None
) -> ConversationSummary:
    job = await owned_job(db, user_id, job_id) if job_id else None
    conversation = Conversation(user_id=user_id, job_id=job_id, title="New chat")
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return summary(conversation, job)


async def list_messages(db: AsyncSession, conversation_id: UUID) -> list[ChatMessage]:
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at, ConversationMessage.id)
    )
    return [
        ChatMessage(
            id=str(message.id),
            role=message.role,
            text=message.text,
            actions=message.actions,
        )
        for message in result.scalars()
    ]


def title_from_text(text: str) -> str:
    short = text.strip()[:60]
    if len(text.strip()) > 60 and " " in short:
        short = short.rsplit(" ", 1)[0]
    return short


async def save_user_message(
    db: AsyncSession, conversation: Conversation, text: str
) -> None:
    count = await db.scalar(
        select(func.count(ConversationMessage.id)).where(
            ConversationMessage.conversation_id == conversation.id
        )
    )
    if count >= 199:
        raise HTTPException(
            status_code=409, detail="Conversation message limit reached."
        )
    if conversation.title == "New chat" and count == 0:
        conversation.title = title_from_text(text)
    db.add(ConversationMessage(conversation_id=conversation.id, role="user", text=text))
    conversation.updated_at = datetime.now(UTC)
    await db.commit()


async def save_assistant_message(
    db: AsyncSession, conversation_id: UUID, text: str
) -> None:
    db.add(
        ConversationMessage(
            conversation_id=conversation_id, role="assistant", text=text
        )
    )
    conversation = await db.get(Conversation, conversation_id)
    conversation.updated_at = datetime.now(UTC)
    await db.commit()

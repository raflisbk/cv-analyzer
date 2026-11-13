from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job, JobStatus
from app.services.chat_stream.prompts import CV_PROMPT, GENERAL_PROMPT
from app.services.llm.chat_context_builder import build_chat_system_prompt
from app.services.memory.retriever import retrieve_job_memory


def personal_context(job: Job) -> str:
    parts = [f"Target role: {job.target_role or 'unspecified'}"]
    scores = job.scores or {}
    if scores:
        parts.append(
            "Scores: "
            + ", ".join(
                f"{key}: {scores[key]}"
                for key in ("overall", "impact", "clarity", "relevance", "completeness")
                if key in scores
            )
        )
    suggestions = [
        item.get("text")
        for card in (job.suggestions or [])
        if isinstance(card, dict)
        for item in card.get("suggestions", [])
        if isinstance(item, dict) and item.get("text")
    ]
    parts.extend(f"Suggestion: {item}" for item in suggestions[:3])
    return "\n".join(parts)


async def build_context(
    db: AsyncSession, conversation: Conversation, user_id: UUID, query: str
) -> tuple[str, list[dict]]:
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation.id)
        .order_by(ConversationMessage.created_at.desc(), ConversationMessage.id.desc())
        .limit(12)
    )
    messages = list(reversed(result.scalars().all()))
    history = [{"role": item.role, "content": item.text} for item in messages]
    if conversation.job_id:
        result = await db.execute(
            select(Job).where(Job.id == conversation.job_id, Job.user_id == user_id)
        )
        job = result.scalar_one_or_none()
        if job:
            memory = await retrieve_job_memory(str(job.id), query, limit=5, session=db)
            return CV_PROMPT + "\n\n" + build_chat_system_prompt(job, memory), history
    result = await db.execute(
        select(Job)
        .where(Job.user_id == user_id, Job.status == JobStatus.COMPLETE)
        .order_by(Job.updated_at.desc())
        .limit(1)
    )
    job = result.scalar_one_or_none()
    prompt = GENERAL_PROMPT + (
        "\n\nPersonal context from the most recent completed analysis:\n"
        + personal_context(job)
        if job
        else ""
    )
    return prompt, history

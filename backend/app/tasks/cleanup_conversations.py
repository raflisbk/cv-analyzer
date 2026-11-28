import asyncio
from datetime import UTC, datetime

from sqlalchemy import delete

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.models.conversation import Conversation
from app.services.chat_stream.manage import retention
from app.tasks.celery_app import celery_app


async def purge_expired_conversations(db, now: datetime | None = None) -> int:
    cutoff = (now or datetime.now(UTC)) - retention()
    result = await db.execute(
        delete(Conversation).where(
            Conversation.deleted_at.is_not(None), Conversation.deleted_at < cutoff
        )
    )
    await db.commit()
    return result.rowcount or 0


async def _run() -> int:
    from app.db.session import async_session_maker

    async with async_session_maker() as db:
        return await purge_expired_conversations(db)


@celery_app.task(name="app.tasks.cleanup_conversations.purge_deleted_conversations")
def purge_deleted_conversations() -> dict[str, int]:
    deleted = asyncio.run(_run())
    logger.info(
        "conversation_purge_done",
        deleted=deleted,
        retention_hours=get_settings().CV_ANALYZER_CONVERSATION_UNDO_HOURS,
    )
    return {"deleted": deleted}

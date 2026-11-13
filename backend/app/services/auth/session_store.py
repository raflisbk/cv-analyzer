from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.user_session import UserSession
from app.services.auth.tokens import hash_refresh_token, new_refresh_token


def current_time() -> datetime:
    return datetime.now(UTC)


def active(session: UserSession, now: datetime) -> bool:
    return (
        session.revoked_at is None
        and session.replaced_by_id is None
        and session.idle_expires_at > now
        and session.absolute_expires_at > now
    )


async def create_session(
    db: AsyncSession,
    user_id: UUID,
    user_agent: str | None,
    ip: str | None,
    now: datetime | None = None,
    family_id: UUID | None = None,
    absolute_expires_at: datetime | None = None,
) -> tuple[UserSession, str]:
    now = now or current_time()
    settings = get_settings()
    absolute = absolute_expires_at or now + timedelta(
        days=settings.CV_ANALYZER_REFRESH_ABSOLUTE_DAYS
    )
    refresh = new_refresh_token()
    session = UserSession(
        id=uuid4(),
        user_id=user_id,
        family_id=family_id or uuid4(),
        refresh_hash=hash_refresh_token(refresh),
        created_at=now,
        last_used_at=now,
        idle_expires_at=min(
            now + timedelta(days=settings.CV_ANALYZER_REFRESH_IDLE_DAYS), absolute
        ),
        absolute_expires_at=absolute,
        user_agent=(user_agent or "")[:255],
        ip=(ip or "")[:45],
    )
    db.add(session)
    await db.flush()
    return session, refresh


async def session_by_refresh(db: AsyncSession, token: str) -> UserSession | None:
    result = await db.execute(
        select(UserSession)
        .where(UserSession.refresh_hash == hash_refresh_token(token))
        .with_for_update()
    )
    return result.scalar_one_or_none()


async def revoke_family(db: AsyncSession, family_id: UUID, now: datetime) -> None:
    await db.execute(
        update(UserSession)
        .where(UserSession.family_id == family_id, UserSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )


async def revoke_user(db: AsyncSession, user_id: UUID, now: datetime) -> None:
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )


async def cleanup_old_sessions(db: AsyncSession, now: datetime | None = None) -> int:
    cutoff = (now or current_time()) - timedelta(days=7)
    result = await db.execute(
        delete(UserSession).where(UserSession.absolute_expires_at < cutoff)
    )
    await db.commit()
    return result.rowcount or 0

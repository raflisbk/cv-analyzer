from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_session import UserSession
from app.services.auth.identity import access_claims
from app.services.auth.session_store import (
    active,
    current_time,
    revoke_user,
    session_by_refresh,
)


async def logout_session(
    db: AsyncSession, request, now: datetime | None = None
) -> None:
    now = now or current_time()
    claims = access_claims(request)
    session = await db.get(UserSession, claims[1]) if claims else None
    if session is None:
        refresh = request.cookies.get("refresh_token")
        session = await session_by_refresh(db, refresh) if refresh else None
    if session is not None and (claims is None or session.user_id == claims[0]):
        session.revoked_at = now
        await db.commit()


async def logout_all(
    db: AsyncSession, user_id: UUID, now: datetime | None = None
) -> None:
    await revoke_user(db, user_id, now or current_time())
    await db.commit()


async def list_sessions(
    db: AsyncSession, user_id: UUID, now: datetime | None = None
) -> list[UserSession]:
    now = now or current_time()
    result = await db.execute(
        select(UserSession)
        .where(
            UserSession.user_id == user_id,
            UserSession.revoked_at.is_(None),
            UserSession.replaced_by_id.is_(None),
            UserSession.idle_expires_at > now,
            UserSession.absolute_expires_at > now,
        )
        .order_by(UserSession.created_at.desc())
    )
    return list(result.scalars())


async def revoke_owned_session(
    db: AsyncSession,
    user_id: UUID,
    session_id: UUID,
    now: datetime | None = None,
) -> bool:
    session = await db.get(UserSession, session_id)
    if session is None or session.user_id != user_id:
        return False
    if active(session, now or current_time()):
        session.revoked_at = now or current_time()
        await db.commit()
    return True

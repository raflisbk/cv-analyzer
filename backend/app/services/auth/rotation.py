from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_session import UserSession
from app.services.auth.session_store import (
    active, create_session, current_time, revoke_family, session_by_refresh,
)


async def rotate_session(
    db: AsyncSession, token: str, user_agent: str | None, ip: str | None,
    now: datetime | None = None,
) -> tuple[User, UserSession, str] | None:
    now = now or current_time()
    session = await session_by_refresh(db, token)
    if session is None:
        return None
    if session.replaced_by_id is not None:
        await revoke_family(db, session.family_id, now)
        await db.commit()
        return None
    if not active(session, now):
        return None
    user = await db.get(User, session.user_id)
    if user is None or not user.is_active:
        return None
    replacement, refresh = await create_session(
        db, session.user_id, user_agent, ip, now, session.family_id,
        session.absolute_expires_at,
    )
    session.revoked_at = now
    session.replaced_by_id = replacement.id
    session.last_used_at = now
    await db.commit()
    return user, replacement, refresh

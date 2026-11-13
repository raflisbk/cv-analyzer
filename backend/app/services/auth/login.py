from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_session import UserSession
from app.services.auth.session_store import create_session, current_time


async def upsert_google_user(db: AsyncSession, google_user: dict) -> User:
    result = await db.execute(select(User).where(User.google_id == google_user["google_id"]))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(google_id=google_user["google_id"], email=google_user["email"])
        db.add(user)
    user.name = google_user["name"]
    user.picture = google_user["picture"]
    await db.flush()
    return user


async def login(
    db: AsyncSession, google_user: dict, user_agent: str | None, ip: str | None,
    now: datetime | None = None,
) -> tuple[User, UserSession, str]:
    user = await upsert_google_user(db, google_user)
    if not user.is_active:
        raise ValueError("Inactive user")
    session, refresh = await create_session(db, user.id, user_agent, ip, now or current_time())
    await db.commit()
    return user, session, refresh

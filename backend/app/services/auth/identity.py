from uuid import UUID

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_token
from app.models.user import User
from app.models.user_session import UserSession
from app.services.auth.session_store import active, current_time


def access_claims(request: Request) -> tuple[UUID, UUID] | None:
    token = request.cookies.get("access_token")
    payload = verify_token(token) if token else None
    if not payload or payload.get("typ") != "access":
        return None
    try:
        return UUID(payload["sub"]), UUID(payload["sid"])
    except (KeyError, TypeError, ValueError):
        return None


async def authenticated_user(db: AsyncSession, request: Request) -> User | None:
    claims = access_claims(request)
    if claims is None:
        return None
    user_id, session_id = claims
    session = await db.get(UserSession, session_id)
    if (
        session is None
        or session.user_id != user_id
        or not active(session, current_time())
    ):
        return None
    user = await db.get(User, user_id)
    return user if user is not None and user.is_active else None

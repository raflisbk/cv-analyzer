from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_token
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.user import User


def get_current_settings() -> Settings:
    return get_settings()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Return the authenticated user, or None if not logged in."""
    token = request.cookies.get("access_token")
    if not token:
        return None

    payload = verify_token(token)
    if not payload:
        return None

    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        return None

    return user


async def require_user(
    user: User | None = Depends(get_current_user),
) -> User:
    """Require authenticated user; raises 401 if not logged in."""
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return user

from typing import Any

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


def check_job_access(job: "Any", current_user: User | None) -> None:
    """Raises 403 if the job is owned by a user and current_user is not that user.

    Anonymous jobs (user_id=NULL) are publicly accessible via UUID-as-secret.
    User-owned jobs require the requesting user to be the owner.
    """
    if job.user_id is not None:
        if current_user is None or str(current_user.id) != str(job.user_id):
            raise HTTPException(status_code=403, detail="Access denied.")

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from jose import jwt

from app.core.config import get_settings


def issue_access_token(user_id: UUID, email: str, session_id: UUID, now: datetime) -> str:
    settings = get_settings()
    return jwt.encode(
        {
            "sub": str(user_id),
            "email": email,
            "sid": str(session_id),
            "iat": now,
            "exp": now + timedelta(minutes=settings.CV_ANALYZER_ACCESS_TOKEN_MINUTES),
            "typ": "access",
        },
        settings.CV_ANALYZER_JWT_SECRET,
        algorithm=settings.CV_ANALYZER_JWT_ALGORITHM,
    )


def new_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

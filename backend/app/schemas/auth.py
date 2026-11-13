from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    access_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    picture: str | None


class SessionResponse(BaseModel):
    id: UUID
    createdAt: datetime
    lastUsedAt: datetime
    userAgent: str | None
    ip: str | None
    current: bool

import uuid
from datetime import UTC, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Error schema per D-24"""

    code: str
    message: str
    details: dict | None = None


class ResponseMeta(BaseModel):
    """Response metadata per D-23"""

    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class WrappedResponse(BaseModel, Generic[T]):
    """Wrapped response format per D-23

    Provides consistent API response structure with data, error, and metadata fields.
    """

    data: T | None = None
    error: ErrorDetail | None = None
    meta: ResponseMeta = Field(default_factory=ResponseMeta)

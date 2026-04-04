from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

T = TypeVar('T')


class ErrorDetail(BaseModel):
    """Error schema per D-24"""
    code: str
    message: str
    details: Optional[dict] = None


class ResponseMeta(BaseModel):
    """Response metadata per D-23"""
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class WrappedResponse(BaseModel, Generic[T]):
    """Wrapped response format per D-23
    
    Provides consistent API response structure with data, error, and metadata fields.
    """
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None
    meta: ResponseMeta = Field(default_factory=ResponseMeta)

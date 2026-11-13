from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class CreateConversation(BaseModel):
    jobId: UUID | None = None


class SendMessage(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class GeneralScope(BaseModel):
    type: Literal["general"] = "general"


class CvScope(BaseModel):
    type: Literal["cv"] = "cv"
    jobId: str
    fileName: str


class ConversationSummary(BaseModel):
    id: str
    title: str
    scope: GeneralScope | CvScope
    updatedAt: datetime


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    text: str
    actions: list[dict] | None = None

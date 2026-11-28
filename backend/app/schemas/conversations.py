from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field, StringConstraints, model_validator


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
    pinned: bool = False
    pinnedAt: datetime | None = None
    snippet: str | None = None


class UpdateConversation(BaseModel):
    title: (
        Annotated[
            str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
        ]
        | None
    ) = None
    pinned: bool | None = None

    @model_validator(mode="after")
    def require_a_change(self) -> "UpdateConversation":
        if self.title is None and self.pinned is None:
            raise ValueError("Provide a title or pinned.")
        return self


class DeletedConversation(BaseModel):
    id: str
    deletedAt: datetime
    restoreUntil: datetime


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    text: str
    actions: list[dict] | None = None

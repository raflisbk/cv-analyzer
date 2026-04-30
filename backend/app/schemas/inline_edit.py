"""Inline edit schemas."""

from typing import Any

from pydantic import BaseModel, Field


class InlineEditRequest(BaseModel):
    """Request schema for inline AI editing."""

    selectedText: str = Field(..., description="Text selected by user in PDF viewer")
    prompt: str = Field(..., description="User's prompt for how to improve the text")
    cvContext: dict[str, Any] | None = Field(
        default=None, description="Optional CV context (scores, suggestions, skills)"
    )


class InlineEditResponse(BaseModel):
    """Response schema for inline AI editing."""

    originalText: str = Field(..., description="Original text selected by user")
    rewrittenText: str = Field(..., description="AI-rewritten version of the text")
    explanation: str | None = Field(
        default=None, description="Optional explanation of changes made"
    )
    error: str | None = Field(
        default=None, description="Error message if rewrite failed"
    )

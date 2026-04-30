"""Workspace hydration schemas."""

from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.analysis import (
    AtsCheck,
    ComparisonResult,
    GrammarIssue,
    ScoreResult,
    SectionResult,
    SuggestionCard,
)
from app.schemas.anchors import SuggestionAnchorRecord


class WorkspaceFileInfo(BaseModel):
    """Job-scoped file metadata safe to expose to the workspace."""

    filename: str | None = None
    mime_type: str | None = None
    size: int | None = None
    extension: str | None = None


class WorkspaceDocumentPayload(BaseModel):
    """Document content available to hydrate the workspace shell."""

    source_text: str | None = None
    sections: list[SectionResult] = Field(default_factory=list)
    draft_content: dict | None = None


class WorkspaceAnalysisContext(BaseModel):
    """Analysis subset reused by the workspace shell."""

    scores: ScoreResult | None = None
    ats_checks: list[AtsCheck] = Field(default_factory=list)
    suggestions: list[SuggestionCard] | None = None
    comparison_result: ComparisonResult | None = None
    comparison_status: str | None = None
    grammar_issues: list[GrammarIssue] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    """Single chat message in conversation history."""

    timestamp: str  # ISO 8601 datetime string
    role: Literal["user", "assistant"]
    content: str
    status: Literal["complete", "streaming", "error"] = "complete"


class WorkspaceNavigation(BaseModel):
    """Job-scoped navigation affordances for workspace-related views."""

    workspace_url: str
    results_url: str


class WorkspaceHydration(BaseModel):
    """Read-only workspace hydration contract keyed by job UUID."""

    job_id: str
    status: Literal["preparing", "ready", "failed"]
    file: WorkspaceFileInfo
    document: WorkspaceDocumentPayload
    analysis: WorkspaceAnalysisContext
    navigation: WorkspaceNavigation
    suggestion_anchors: list[SuggestionAnchorRecord] = Field(default_factory=list)
    messages: list[ChatMessage] = Field(default_factory=list)
    error: str | None = None


# Draft content patch schemas


class WorkspaceContentPatch(BaseModel):
    """Draft content PATCH body — sections keyed by section type string."""

    sections: dict[str, Any]  # { sectionType: TiptapJSONContent }


class WorkspaceContentSaveResult(BaseModel):
    """Response after successful workspace draft save."""

    saved: bool
    updated_at: str


# File presigned URL schema
class WorkspaceFileUrl(BaseModel):
    """Presigned R2 URL untuk akses langsung ke PDF CV yang diupload."""

    file_url: str
    expires_in: int = 3600  # detik

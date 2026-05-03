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

    filename: str | None = None
    mime_type: str | None = None
    size: int | None = None
    extension: str | None = None


class WorkspaceDocumentPayload(BaseModel):

    source_text: str | None = None
    sections: list[SectionResult] = Field(default_factory=list)
    draft_content: dict | None = None


class WorkspaceAnalysisContext(BaseModel):

    scores: ScoreResult | None = None
    ats_checks: list[AtsCheck] = Field(default_factory=list)
    suggestions: list[SuggestionCard] | None = None
    comparison_result: ComparisonResult | None = None
    comparison_status: str | None = None
    grammar_issues: list[GrammarIssue] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ChatMessage(BaseModel):

    timestamp: str
    role: Literal["user", "assistant"]
    content: str
    status: Literal["complete", "streaming", "error"] = "complete"


class WorkspaceNavigation(BaseModel):

    workspace_url: str
    results_url: str


class WorkspaceHydration(BaseModel):

    job_id: str
    status: Literal["preparing", "ready", "failed"]
    file: WorkspaceFileInfo
    document: WorkspaceDocumentPayload
    analysis: WorkspaceAnalysisContext
    navigation: WorkspaceNavigation
    suggestion_anchors: list[SuggestionAnchorRecord] = Field(default_factory=list)
    messages: list[ChatMessage] = Field(default_factory=list)
    error: str | None = None


class WorkspaceContentPatch(BaseModel):

    sections: dict[str, Any]


class WorkspaceContentSaveResult(BaseModel):

    saved: bool
    updated_at: str


class WorkspaceFileUrl(BaseModel):

    file_url: str
    expires_in: int = 3600

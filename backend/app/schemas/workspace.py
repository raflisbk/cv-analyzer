"""Workspace hydration schemas for Phase 11."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.analysis import (
    AtsCheck,
    ComparisonResult,
    ScoreResult,
    SectionResult,
    SuggestionCard,
)


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


class WorkspaceAnalysisContext(BaseModel):
    """Analysis subset reused by the workspace shell."""

    scores: ScoreResult | None = None
    ats_checks: list[AtsCheck] = Field(default_factory=list)
    suggestions: list[SuggestionCard] | None = None
    comparison_result: ComparisonResult | None = None
    comparison_status: str | None = None


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
    error: str | None = None

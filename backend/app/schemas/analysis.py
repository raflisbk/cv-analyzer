"""
Analysis result schemas per D-23.
Used by GET /api/v1/jobs/{id}/results endpoint.
"""

from typing import Any

from pydantic import BaseModel

from app.models.job import JobStatus


class SectionResult(BaseModel):
    """A detected CV section with its entities"""

    type: str
    text: str
    entities: list[dict[str, Any]] = []


class ScoreResult(BaseModel):
    """Multi-dimensional CV scores per SCORE-01..05"""

    overall: int
    clarity: int
    impact: int
    completeness: int
    relevance: int


class GrammarIssue(BaseModel):
    """A single grammar/spelling issue per D-12"""

    text: str
    offset: int
    suggestion: str
    rule: str


class AtsCheck(BaseModel):
    """A single ATS compatibility check result per D-13, D-14"""

    check: str
    status: str  # "pass" | "warn" | "fail"
    detail: str = ""


class AnalysisResult(BaseModel):
    """
    Full analysis result per D-23.
    Returned by GET /api/v1/jobs/{id}/results.
    """

    job_id: str
    status: JobStatus

    # Populated after scoring task completes
    scores: ScoreResult | None = None

    # Populated after NLP task completes
    sections: list[SectionResult] = []
    skills: list[str] = []

    # Populated after grammar check task completes
    grammar_issues: list[GrammarIssue] = []
    ats_checks: list[AtsCheck] = []

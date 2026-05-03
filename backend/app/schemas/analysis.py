from typing import Any, Literal

from pydantic import BaseModel

from app.models.job import JobStatus


class SectionResult(BaseModel):

    type: str
    text: str
    entities: list[dict[str, Any]] = []


class ScoreResult(BaseModel):

    overall: int
    clarity: int
    impact: int
    completeness: int
    relevance: int
    reasonings: dict[str, str] = {}


class GrammarIssue(BaseModel):

    text: str
    offset: int
    suggestion: str
    rule: str


class AtsCheck(BaseModel):

    check: str
    status: str
    detail: str = ""


class SuggestionItem(BaseModel):

    priority: Literal["high_impact", "quick_win"]
    text: str
    explanation: str = ""
    type: Literal["action_verb", "impact_metric", "missing_section"]
    original_text: str | None = None
    after_text: str | None = None


class SuggestionCard(BaseModel):

    section: str
    suggestions: list[SuggestionItem]


class ComparisonResult(BaseModel):

    match_pct: int
    matched_skills: list[str]
    missing_skills: list[str]
    matched_experience: list[str]
    missing_experience: list[str]
    overall_recommendation: str


class SkillGapGroup(BaseModel):

    present: list[str] = []
    missing: list[str] = []
    partial: list[str] = []


class JobRole(BaseModel):

    id: str
    title: str
    seniority: str
    industry: str


class AnalysisResult(BaseModel):

    job_id: str
    status: JobStatus

    scores: ScoreResult | None = None

    sections: list[SectionResult] = []
    skills: list[str] = []

    grammar_issues: list[GrammarIssue] = []
    ats_checks: list[AtsCheck] = []

    suggestions: list[SuggestionCard] | None = None

    comparison_result: ComparisonResult | None = None
    comparison_status: str | None = None

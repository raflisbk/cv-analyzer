from typing import Any, Literal

from pydantic import BaseModel

from app.models.job import JobStatus


class SectionResult(BaseModel):

    type: str
    text: str
    entities: list[dict[str, Any]] = []


class BenchmarkResult(BaseModel):
    percentile: int = 0
    sample_size: int = 0


class ScoreResult(BaseModel):

    overall: int
    clarity: int
    impact: int
    completeness: int
    relevance: int
    reasonings: dict[str, str] = {}
    jd_relevance: bool = False
    target_role: str | None = None
    benchmark: BenchmarkResult = BenchmarkResult()
    scoring_method: str = "llm"
    scoring_algorithm_version: str = "v3"
    # Deterministic objective metrics
    metrics: dict[str, Any] = {}
    # Score adjustments applied (low confidence when LLM & deterministic disagree strongly)
    low_confidence: bool = False
    # Per-dimension delta vs parent job (present when parent_job_id is set)
    version_delta: dict[str, int] | None = None
    # Ensemble metadata
    ensemble_runs: int = 1
    score_ranges: dict[str, int] = {}
    # ATS numeric score (0-100) — populated on re-run when ats_checks exist
    ats_score: int | None = None
    # JD keyword gap (populated when JD was uploaded with CV)
    jd_keyword_gap: dict[str, Any] | None = None
    # Grammar-based clarity penalty applied in llm_suggest_task (-10 to 0)
    grammar_clarity_penalty: int | None = None


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


class SkillGapItem(BaseModel):
    skill: str
    priority: Literal["high", "medium", "low"] = "low"
    category: str = "General"
    why_important: str = ""
    resources: list[dict[str, str]] = []


class JdRedFlag(BaseModel):
    flag: str
    severity: Literal["warning", "info"] = "info"
    detail: str = ""


class ComparisonResult(BaseModel):

    match_pct: int
    matched_skills: list[str]
    missing_skills: list[str]
    matched_experience: list[str]
    missing_experience: list[str]
    overall_recommendation: str
    skill_gaps: list[SkillGapItem] = []
    red_flags: list[JdRedFlag] = []
    jd_quality: str | None = None


class SkillGapGroup(BaseModel):

    present: list[str] = []
    missing: list[str] = []
    partial: list[str] = []


class JobRole(BaseModel):

    id: str
    title: str
    seniority: str
    industry: str


class ScoreVersion(BaseModel):
    job_id: str
    version: int
    overall: int
    created_at: str
    delta: int | None = None  # overall score change vs previous version


class ArchetypeResult(BaseModel):
    domain: str = "unknown"
    domain_display: str = ""
    type: str
    display_name: str = ""
    confidence: str = "medium"
    reasoning: str = ""
    description: str = ""


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

    parent_job_id: str | None = None
    version_history: list[ScoreVersion] = []

    archetype: ArchetypeResult | None = None

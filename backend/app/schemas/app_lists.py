from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class AppListModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class CvSummary(AppListModel):
    job_id: str
    file_name: str
    target_role: str | None
    score: float | None
    status: str
    updated_at: str
    pages: int
    word_count: int


class Dimensions(AppListModel):
    impact: float
    clarity: float
    relevance: float
    completeness: float


class VersionSummary(AppListModel):
    label: str
    score: float
    at: str


class FileFacts(AppListModel):
    type: str
    pages: int
    size_kb: int
    bullets: int


class ReportSummary(AppListModel):
    job_id: str
    file_name: str
    role: str | None
    analyzed_at: str
    score: float
    dimensions: Dimensions
    versions: list[VersionSummary]
    top_fix: str
    file_facts: FileFacts


class RecurringFix(AppListModel):
    dimension: str
    cv_count: int
    text: str


class ReportAggregate(AppListModel):
    count: int = 0
    best_score: float = 0
    average_impact: int = 0
    last_analysis_at: str = ""
    open_fixes: int = 0
    recurring_fixes: list[RecurringFix] = Field(default_factory=list)
    average_by_dimension: Dimensions = Field(
        default_factory=lambda: Dimensions(
            impact=0, clarity=0, relevance=0, completeness=0
        )
    )


class ReportsData(AppListModel):
    reports: list[ReportSummary]
    aggregate: ReportAggregate

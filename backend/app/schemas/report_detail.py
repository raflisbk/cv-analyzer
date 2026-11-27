from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.app_lists import to_camel


class ReportModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ReportMetric(ReportModel):
    key: str = ""
    label: str
    count: int = 0
    total: int = 0
    value: str
    percent: int


class ReportEvidence(ReportModel):
    text: str
    note: str
    note_key: str = ""
    positive: bool


class ReportDimension(ReportModel):
    key: Literal["impact", "clarity", "relevance", "completeness"]
    score: int
    previous: int
    projected: int
    description: str
    metrics: list[ReportMetric]
    hint: str
    evidence: list[ReportEvidence]


class ReportFix(ReportModel):
    title: str
    text: str
    points: int
    section: str = ""
    type: str | None = None


class ReportSection(ReportModel):
    key: str = ""
    name: str
    score: int
    note: str
    note_key: str = ""


class ReportBullet(ReportModel):
    text: str
    source: str
    strength: Literal["weak", "fair", "strong"]
    tags: list[str]
    tag_keys: list[str] = Field(default_factory=list)


class GrammarNote(ReportModel):
    before: str
    after: str
    location: str


class ReportGrammar(ReportModel):
    spelling: int = 0
    grammar: int = 0
    style: int = 0
    notes: list[GrammarNote] = Field(default_factory=list)


class PresentKeyword(ReportModel):
    name: str
    count: int


class MissingKeyword(ReportModel):
    name: str
    posts: int = 0


class ReportKeywords(ReportModel):
    present: list[PresentKeyword]
    missing: list[MissingKeyword]
    total: int


class AtsCheckView(ReportModel):
    text: str
    ok: bool


class ReportAts(ReportModel):
    score: int
    facts: list[str]
    format: str = ""
    pages: int = 0
    size_kb: int = 0
    checks: list[AtsCheckView]


class ReportVerdict(ReportModel):
    key: str = ""
    title: str
    body: str


class ReportFactCounts(ReportModel):
    pages: int
    bullets: int
    words: int


class VersionSummaryFields(ReportModel):
    summary_kind: Literal["first", "unchanged", "changed"] | None = None
    changed_dimension: (
        Literal["impact", "clarity", "relevance", "completeness"] | None
    ) = None
    changed_delta: int | None = None


class VersionData(VersionSummaryFields):
    id: str
    label: str
    at: str
    score: int
    delta: int | None
    summary: str
    current: bool


class VersionDiff(ReportModel):
    before: str
    after: str


class ReportVersion(VersionSummaryFields):
    label: str
    score: int
    at: str
    summary: str


class ReportDetail(ReportModel):
    file_name: str
    role: str
    version: str
    score: int
    previous_score: int
    projected_score: int
    verdict: ReportVerdict
    top_percent: int
    facts: list[str]
    fact_counts: ReportFactCounts | None = None
    fixes: list[ReportFix]
    dimensions: list[ReportDimension]
    sections: list[ReportSection]
    bullets: list[ReportBullet]
    grammar: ReportGrammar
    keywords: ReportKeywords
    ats: ReportAts
    versions: list[ReportVersion]

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.app_lists import to_camel


class ReportModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ReportMetric(ReportModel):
    label: str
    value: str
    percent: int


class ReportEvidence(ReportModel):
    text: str
    note: str
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


class ReportSection(ReportModel):
    name: str
    score: int
    note: str


class ReportBullet(ReportModel):
    text: str
    source: str
    strength: Literal["weak", "fair", "strong"]
    tags: list[str]


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
    checks: list[AtsCheckView]


class ReportVerdict(ReportModel):
    title: str
    body: str


class VersionData(ReportModel):
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


class ReportVersion(ReportModel):
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
    fixes: list[ReportFix]
    dimensions: list[ReportDimension]
    sections: list[ReportSection]
    bullets: list[ReportBullet]
    grammar: ReportGrammar
    keywords: ReportKeywords
    ats: ReportAts
    versions: list[ReportVersion]

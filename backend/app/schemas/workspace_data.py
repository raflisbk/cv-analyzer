from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.app_lists import to_camel


class ViewModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class AtsCompatibility(ViewModel):
    system: str
    rating: int


class AtsParsedField(ViewModel):
    field: str
    value: str
    confidence: float


class AtsLine(ViewModel):
    text: str
    flagged: bool


class AtsPlainText(ViewModel):
    lines: list[AtsLine] = Field(default_factory=list)
    note: str = ""


class AtsCheck(ViewModel):
    group: str
    label: str
    status: Literal["pass", "warn", "fail"]


class AtsHiddenText(ViewModel):
    found: bool = False
    items: list[str] = Field(default_factory=list)


class AtsData(ViewModel):
    score: int = 0
    summary: str = ""
    compat: list[AtsCompatibility] = Field(default_factory=list)
    parsed: list[AtsParsedField] = Field(default_factory=list)
    plain_text: AtsPlainText = Field(default_factory=AtsPlainText)
    checks: list[AtsCheck] = Field(default_factory=list)
    hidden_text: AtsHiddenText = Field(default_factory=AtsHiddenText)


class GrammarStats(ViewModel):
    reading_grade: float = 0
    words_per_sentence: float = 0
    passive_lines: int = 0
    tone: str = "Professional"


class GrammarNote(ViewModel):
    id: str
    type: Literal["spelling", "grammar", "style"]
    location: str
    before: str
    after: str


class GrammarData(ViewModel):
    stats: GrammarStats = Field(default_factory=GrammarStats)
    notes: list[GrammarNote] = Field(default_factory=list)

import re
from typing import Literal, Protocol, Self

from pydantic import BaseModel, ValidationInfo, field_validator, model_validator

from app.services.llm.fact_guard import (
    PLACEHOLDER,
    NeedsInput,
    allowed_input,
    input_question,
    numbers_in,
)


class SuggestionItemOutput(BaseModel):

    priority: Literal["high_impact", "quick_win"]
    text: str
    explanation: str = ""
    type: Literal["action_verb", "impact_metric", "missing_section"] = "action_verb"
    original_text: str | None = None
    after_text: str | None = None
    needs_input: list[NeedsInput] = []

    @model_validator(mode="after")
    def drop_invented_placeholders(self, info: ValidationInfo) -> Self:
        if not self.after_text:
            self.needs_input = []
            return self
        original = self.original_text or ""
        placeholders = PLACEHOLDER.findall(self.after_text)
        if any(p not in original and not allowed_input(p) for p in placeholders):
            self.after_text = None
            self.needs_input = []
            return self
        self.needs_input = [
            NeedsInput(token=p, question=input_question(p))
            for p in dict.fromkeys(placeholders)
            if p not in original and allowed_input(p)
        ]
        without_placeholders = PLACEHOLDER.sub("", self.after_text)
        source = (info.context or {}).get("cv_text", "") + " " + original
        if not numbers_in(without_placeholders) <= numbers_in(source):
            self.after_text = None
            self.needs_input = []
        return self

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, v: object) -> str:
        if v in ("high_impact", "quick_win"):
            return str(v)
        return "quick_win"

    @field_validator("type", mode="before")
    @classmethod
    def normalize_type(cls, v: object) -> str:
        if v in ("action_verb", "impact_metric", "missing_section"):
            return str(v)
        return "action_verb"

    @field_validator("original_text", "after_text", mode="before")
    @classmethod
    def normalize_whitespace(cls, v: object) -> str | None:
        if v and isinstance(v, str):
            cleaned = re.sub(r"\s+", " ", v).strip()
            return cleaned or None
        return None


class SuggestionCardOutput(BaseModel):

    section: str
    suggestions: list[SuggestionItemOutput]


class SuggestionsOutput(BaseModel):

    suggestions: list[SuggestionCardOutput]


class LLMService(Protocol):

    def generate_suggestions(
        self,
        cv_text: str,
        sections: list[dict],
        rag_context: str,
    ) -> dict: ...

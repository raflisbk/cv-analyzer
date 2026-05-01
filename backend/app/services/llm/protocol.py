from typing import Literal, Protocol

from pydantic import BaseModel, field_validator


class SuggestionItemOutput(BaseModel):

    priority: Literal["high_impact", "quick_win"]
    text: str
    explanation: str = ""
    type: Literal["action_verb", "impact_metric", "missing_section"] = "action_verb"
    original_text: str | None = None
    after_text: str | None = None

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

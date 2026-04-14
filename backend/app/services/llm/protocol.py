"""
LLM service abstraction layer per LLM-05, D-04.
Protocol allows swapping providers (HF Inference, others) without changing call sites.
Pydantic models enforce JSON output schema per LLM-04, D-03.
"""

from typing import Literal, Protocol

from pydantic import BaseModel, field_validator


class SuggestionItemOutput(BaseModel):
    """A single CV improvement suggestion per LLM-01, LLM-02, LLM-03."""

    priority: Literal["high_impact", "quick_win"]
    text: str
    type: Literal["action_verb", "impact_metric", "missing_section"] = "action_verb"
    original_text: str | None = None
    after_text: str | None = None

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, v: object) -> str:
        """Coerce unknown priority values to 'quick_win' instead of failing."""
        if v in ("high_impact", "quick_win"):
            return str(v)
        return "quick_win"

    @field_validator("type", mode="before")
    @classmethod
    def normalize_type(cls, v: object) -> str:
        """Coerce unknown type values to 'action_verb' instead of failing."""
        if v in ("action_verb", "impact_metric", "missing_section"):
            return str(v)
        return "action_verb"


class SuggestionCardOutput(BaseModel):
    """Suggestions grouped by CV section per D-06."""

    section: str
    suggestions: list[SuggestionItemOutput]


class SuggestionsOutput(BaseModel):
    """Root output structure validated from LLM JSON response per LLM-04."""

    suggestions: list[SuggestionCardOutput]


class LLMService(Protocol):
    """
    Provider-agnostic LLM service interface per LLM-05, D-04.
    Implement this Protocol to add new providers (Claude, Gemini, etc.)
    without changing llm_suggest_task call sites.
    """

    def generate_suggestions(
        self,
        cv_text: str,
        sections: list[dict],
        rag_context: str,
    ) -> dict:
        """
        Generate structured CV improvement suggestions.

        Args:
            cv_text: Full extracted CV text.
            sections: List of detected sections from nlp_result['sections'].
            rag_context: Concatenated RAG chunks relevant to this CV.

        Returns:
            Dict with keys: 'raw_json' (str), 'prompt_tokens' (int),
            'completion_tokens' (int).

        Raises:
            Exception: Re-raised after all retries exhausted (D-17).
        """
        ...

from app.services.llm.protocol import SuggestionItemOutput
from app.services.llm.suggestion_prompts import SYSTEM_PROMPT_TEMPLATE

ORIGINAL = (
    "- Built FastAPI services with PostgreSQL and Redis, cutting p95 latency by 35%"
)


def _item(after_text: str | None, original_text: str | None = ORIGINAL):
    return SuggestionItemOutput(
        priority="quick_win",
        text="Add context",
        original_text=original_text,
        after_text=after_text,
    )


def test_concrete_rewrite_is_kept():
    rewrite = (
        "- Built FastAPI services with PostgreSQL and Redis, cutting p95 latency by 35%"
    )

    assert _item(rewrite).after_text == rewrite


def test_invented_bracket_placeholder_drops_the_rewrite():
    rewrite = "- Built FastAPI services for [service/workflow], cutting latency by [X%]"

    assert _item(rewrite).after_text is None


def test_bracket_text_already_in_the_cv_is_kept():
    original = "- Led migration to [Kubernetes] clusters"
    rewrite = "- Led migration of 3 services to [Kubernetes] clusters"

    assert _item(rewrite, original_text=original).after_text == rewrite


def test_missing_after_text_is_untouched():
    assert _item(None).after_text is None


def test_prompt_forbids_inventing_facts_and_placeholders():
    assert "NEVER invent" in SYSTEM_PROMPT_TEMPLATE
    assert "bracketed placeholders" in SYSTEM_PROMPT_TEMPLATE

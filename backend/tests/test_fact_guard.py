import json

import pytest

from app.services.llm.fact_guard import numbers_in
from app.services.llm.protocol import SuggestionItemOutput
from app.schemas.analysis import SuggestionItem
from app.tasks.llm_suggest import _repair_llm_output


@pytest.mark.parametrize(
    ("source", "rewrite"),
    [
        ("1,200 users", "1200 users"),
        ("$2.5M revenue", "$2,500,000 revenue"),
        ("35% growth", "35 percent growth"),
        ("2020-2023", "2020 to 2023"),
    ],
)
def test_numbers_normalize_equivalent_facts(source, rewrite):
    assert numbers_in(source) == numbers_in(rewrite)


def test_rewrite_accepts_number_in_cv_context():
    item = SuggestionItemOutput.model_validate(
        {
            "priority": "quick_win",
            "text": "Clarify",
            "original_text": "Led team",
            "after_text": "Led 12 people",
        },
        context={"cv_text": "Managed 12 people"},
    )
    assert item.after_text == "Led 12 people"


def test_rewrite_drops_invented_number():
    item = SuggestionItemOutput.model_validate(
        {
            "priority": "quick_win",
            "text": "Clarify",
            "original_text": "Led team",
            "after_text": "Led 12 people",
        },
        context={"cv_text": "Led team"},
    )
    assert item.after_text is None


def test_allowed_placeholder_requests_input():
    item = SuggestionItemOutput(
        priority="quick_win",
        text="Clarify",
        original_text="Led team",
        after_text="Led [how many?] people",
    )
    assert item.after_text == "Led [how many?] people"
    assert item.needs_input[0].token == "[how many?]"


def test_unknown_placeholder_drops_rewrite():
    item = SuggestionItemOutput(
        priority="quick_win",
        text="Clarify",
        original_text="Led team",
        after_text="Led [made up company] team",
    )
    assert item.after_text is None


def test_invented_number_is_absent_from_results_item():
    guarded = SuggestionItemOutput.model_validate(
        {
            "priority": "quick_win",
            "text": "Clarify",
            "original_text": "Led team",
            "after_text": "Led 12 people",
        },
        context={"cv_text": "Led team"},
    )
    result_item = SuggestionItem.model_validate(
        {**guarded.model_dump(), "needsInput": []}
    )
    assert result_item.model_dump(by_alias=True)["after_text"] is None


def test_malformed_llm_json_is_repaired_before_fact_guard():
    raw = '{"suggestions":[{"section":"experience","suggestions":[{"priority":"quick_win","text":"Clarify","original_text":"Led team","after_text":"Led 12 people"}]}'
    repaired = _repair_llm_output(raw, "Managed 12 people")
    item = json.loads(repaired)["suggestions"][0]["suggestions"][0]
    assert (
        SuggestionItemOutput.model_validate(
            item,
            context={"cv_text": "Managed 12 people"},
        ).after_text
        == "Led 12 people"
    )

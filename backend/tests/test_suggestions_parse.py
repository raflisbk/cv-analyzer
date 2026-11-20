import json
from unittest.mock import patch

import pytest

from app.services.llm.protocol import SuggestionsOutput
from app.services.llm.suggestions_parse import parse_suggestions

VALID_ITEM = {"priority": "quick_win", "text": "Clarify the result"}


def test_missing_suggestions_group_keeps_other_group():
    raw = json.dumps(
        {
            "suggestions": [
                {"section": "Experience", "suggestions": [VALID_ITEM]},
                {"section": "Projects"},
            ]
        }
    )

    result = parse_suggestions(raw, "CV text")

    assert [card.section for card in result.suggestions] == ["Experience"]
    assert result.suggestions[0].suggestions[0].text == "Clarify the result"


def test_all_invalid_groups_raise_safe_error():
    raw = json.dumps({"suggestions": [{"section": "Projects"}]})

    with pytest.raises(ValueError, match="No valid suggestions"):
        parse_suggestions(raw, "private CV text")


def test_invalid_item_does_not_remove_valid_item():
    raw = json.dumps(
        {
            "suggestions": [
                {
                    "section": "Experience",
                    "suggestions": [
                        VALID_ITEM,
                        {"priority": "quick_win"},
                    ],
                }
            ]
        }
    )

    result = parse_suggestions(raw, "CV text")

    assert [item.text for item in result.suggestions[0].suggestions] == [
        "Clarify the result"
    ]


def test_valid_output_matches_strict_validation_byte_for_byte():
    raw = json.dumps(
        {
            "suggestions": [
                {
                    "section": "Experience",
                    "suggestions": [
                        {**VALID_ITEM, "original_text": "Original line"},
                    ],
                }
            ]
        }
    )

    assert parse_suggestions(raw, "CV text").model_dump_json() == (
        SuggestionsOutput.model_validate_json(
            raw, context={"cv_text": "CV text"}
        ).model_dump_json()
    )


def test_logs_counts_and_error_types_without_cv_text():
    raw = json.dumps(
        {
            "suggestions": [
                {"section": "Experience", "suggestions": [VALID_ITEM]},
                {"section": "Projects"},
            ]
        }
    )

    with patch("app.services.llm.suggestions_parse.logger.warning") as log:
        parse_suggestions(raw, "private CV text")

    assert log.call_count == 1
    assert log.call_args.kwargs["kept"] == 1
    assert log.call_args.kwargs["dropped"] == 1
    assert "missing" in log.call_args.kwargs["error_types"]
    assert "private CV text" not in str(log.call_args)

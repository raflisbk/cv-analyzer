from app.services.export_templates.apply_fixes import _replacement


def _item(after_text: str) -> dict:
    return {"original_text": "reducing defect rates", "after_text": after_text}


def test_unanswered_placeholder_is_skipped_as_needs_input():
    assert _replacement(_item("reducing defect rates by [%]"), {}) == (
        None,
        "needs_input",
    )


def test_answered_placeholder_is_substituted():
    result = _replacement(_item("reducing defect rates by [%]"), {"%": "30%"})

    assert result == ("reducing defect rates by 30%", "")

"""Test that SuggestionItem has original_text field for before/after comparison."""

import sys

sys.path.insert(0, ".")


from app.schemas.analysis import SuggestionItem


def test_suggestion_item_accepts_original_text():
    """Test 1: SuggestionItem schema accepts original_text field with optional string type."""
    item = SuggestionItem(
        priority="high_impact",
        text="Add quantified metrics",
        type="action_verb",
        original_text="Responsible for managing team",
    )
    assert item.original_text == "Responsible for managing team"


def test_suggestion_item_serializes_original_text():
    """Test 2: SuggestionItem serializes original_text in JSON response."""
    item = SuggestionItem(
        priority="quick_win",
        text="Improved customer satisfaction by 25%",
        type="impact_metric",
        original_text="Helped customers with issues",
    )
    json_dict = item.model_dump()
    assert "original_text" in json_dict
    assert json_dict["original_text"] == "Helped customers with issues"


def test_suggestion_item_backward_compatible():
    """Test 3: Backward compatibility: SuggestionItem works when original_text is None."""
    item = SuggestionItem(
        priority="quick_win", text="Add leadership skills", type="missing_section"
    )
    assert item.original_text is None

    # Should also work without explicitly setting original_text
    item2 = SuggestionItem(
        priority="high_impact", text="Use action verbs", type="action_verb"
    )
    assert item2.original_text is None


if __name__ == "__main__":
    print("Running GREEN tests (should pass after implementation)...")
    try:
        test_suggestion_item_accepts_original_text()
        print("[PASS] Test 1")
    except Exception as e:
        print(f"[FAIL] Test 1: {e}")

    try:
        test_suggestion_item_serializes_original_text()
        print("[PASS] Test 2")
    except Exception as e:
        print(f"[FAIL] Test 2: {e}")

    try:
        test_suggestion_item_backward_compatible()
        print("[PASS] Test 3")
    except Exception as e:
        print(f"[FAIL] Test 3: {e}")

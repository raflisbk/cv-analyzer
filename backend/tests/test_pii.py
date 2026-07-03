"""Tests for PII masking utility per ERROR-04, D-C15.
Wave 0 stub: FAILS until backend/app/core/logging.py has mask_pii() function.
"""

# This import will fail until mask_pii() is added to logging.py (Wave 1)
from app.core.logging import mask_pii


def test_mask_pii_strips_email():
    result = mask_pii("Error: john.doe@example.com caused failure")
    assert "[EMAIL]" in result
    assert "john.doe@example.com" not in result


def test_mask_pii_strips_phone():
    result = mask_pii("Contact +1 (555) 123-4567 for info")
    assert "[PHONE]" in result
    assert "+1 (555) 123-4567" not in result


def test_mask_pii_leaves_safe_text_unchanged():
    result = mask_pii("Database connection failed on port 5432")
    assert result == "Database connection failed on port 5432"


def test_mask_pii_handles_empty_string():
    assert mask_pii("") == ""

import pytest

from app.services.parser import ParsingError, parse_document


def test_parse_document_rejects_unsupported_type():
    """Test unsupported file type raises error"""
    with pytest.raises(ParsingError) as exc:
        parse_document(b"content", ".txt")
    assert "Unsupported file type" in str(exc.value)


def test_validate_extraction_quality_rejects_short_text():
    """Test quality validation per D-09"""
    from app.services.validation import validate_extraction_quality

    score, _ = validate_extraction_quality("Short")
    assert score < 0.3  # Low quality

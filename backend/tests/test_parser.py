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


def test_pdf_metadata_carries_hidden_text_report(monkeypatch):
    import fitz

    from app.services import parser

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Visible CV experience " * 3)
    page.insert_text((72, 100), "Hidden", color=(1, 1, 1))
    monkeypatch.setattr(parser, "validate_extraction_quality", lambda text: (0.9, {}))
    _, metadata = parse_document(doc.tobytes(), ".pdf")
    doc.close()
    assert metadata["hidden_text"] == {"count": 1, "snippets": ["Hidden"]}

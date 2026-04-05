"""Tests for NLP-03: ATS checker service"""

from app.services.ats.checker import check_ats_compatibility
from app.services.nlp.section_detector import CvSection


def _make_sections(*types: str) -> list[CvSection]:
    """Helper to create CvSection list from type names"""
    return [
        CvSection(type=t, text=f"Content for {t}", start_line=i * 5)
        for i, t in enumerate(types)
    ]


def test_check_ats_returns_list() -> None:
    """check_ats_compatibility always returns a list per D-14"""
    result = check_ats_compatibility("Sample CV text")
    assert isinstance(result, list)


def test_check_ats_items_have_required_keys() -> None:
    """Each ATS item has 'check', 'status', 'detail' keys per D-13"""
    results = check_ats_compatibility("Sample CV with email@test.com")
    for item in results:
        assert "check" in item, f"Missing 'check' key in {item}"
        assert "status" in item, f"Missing 'status' key in {item}"
        assert "detail" in item, f"Missing 'detail' key in {item}"


def test_check_ats_status_values_are_valid() -> None:
    """Status values are exactly 'pass', 'warn', or 'fail' per D-14"""
    results = check_ats_compatibility("Sample CV text")
    valid_statuses = {"pass", "warn", "fail"}
    for item in results:
        assert item["status"] in valid_statuses, f"Invalid status: {item['status']}"


def test_check_ats_passes_required_sections() -> None:
    """Standard sections check passes when experience+education+skills present"""
    sections = _make_sections("experience", "education", "skills", "header")
    results = check_ats_compatibility("Sample text", sections=sections)

    section_check = next(
        (r for r in results if r["check"] == "Standard sections present"), None
    )
    assert section_check is not None
    assert section_check["status"] == "pass"


def test_check_ats_fails_missing_required_sections() -> None:
    """Standard sections check warns/fails when sections missing"""
    sections = _make_sections("header")  # No experience, education, or skills
    results = check_ats_compatibility("Sample text", sections=sections)

    section_check = next(
        (r for r in results if r["check"] == "Standard sections present"), None
    )
    assert section_check is not None
    assert section_check["status"] in {"warn", "fail"}


def test_check_ats_detects_table_structure() -> None:
    """Table detection marks as 'warn'"""
    text_with_table = "Name | Skills | Years\nJohn | Python | 5\nJane | Java || 3"
    results = check_ats_compatibility(text_with_table)

    table_check = next((r for r in results if r["check"] == "No tables detected"), None)
    assert table_check is not None
    assert table_check["status"] == "warn"


def test_check_ats_passes_no_table() -> None:
    """No table in CV -> pass"""
    results = check_ats_compatibility("Clean plain text CV with no tables")
    table_check = next((r for r in results if r["check"] == "No tables detected"), None)
    assert table_check is not None
    assert table_check["status"] == "pass"


def test_check_ats_action_verb_density_pass() -> None:
    """CV with 8+ action verbs passes action verb density check"""
    text = (
        "Led and managed team. Built and deployed system. Improved and optimized "
        "pipeline. Designed and implemented APIs. Delivered and shipped features. "
        "Achieved and exceeded targets. Developed and created solutions. "
        "email@test.com +1-555-0100"
    )
    results = check_ats_compatibility(text)
    verb_check = next((r for r in results if r["check"] == "Action verb density"), None)
    assert verb_check is not None
    assert verb_check["status"] == "pass"


def test_check_ats_contact_info_pass() -> None:
    """Email and phone present -> contact check passes"""
    text = "John Doe\njohn@example.com\n+1-555-123-4567\nSoftware Engineer"
    results = check_ats_compatibility(text)
    contact_check = next(
        (r for r in results if r["check"] == "Contact information complete"), None
    )
    assert contact_check is not None
    assert contact_check["status"] == "pass"


def test_check_ats_contact_info_fail() -> None:
    """No email or phone -> contact check fails"""
    text = "John Doe\nSoftware Engineer with no contact info"
    results = check_ats_compatibility(text)
    contact_check = next(
        (r for r in results if r["check"] == "Contact information complete"), None
    )
    assert contact_check is not None
    assert contact_check["status"] == "fail"

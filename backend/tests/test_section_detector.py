"""Tests for NLP-01: section detection service (D-02 hybrid approach)"""

from app.services.nlp.section_detector import CvSection, detect_sections


# Sample CV with clear section headings
_CV_WITH_SECTIONS = """
John Doe
john.doe@email.com

SUMMARY
Experienced software engineer.

EXPERIENCE
Senior Engineer, Acme Corp - 2021-Present
Led migration to microservices.

EDUCATION
BS Computer Science, State University, 2019

SKILLS
Python, FastAPI, Docker, PostgreSQL
"""

_CV_WITH_COLON_HEADINGS = """
Experience:
5 years at various companies.

Education:
BS degree from university.
"""

_CV_NO_SECTIONS = (
    "John Doe\njohn.doe@email.com\nSoftware engineer with 5 years experience."
)


def test_detect_sections_returns_list() -> None:
    """detect_sections always returns a list"""
    result = detect_sections(_CV_WITH_SECTIONS)
    assert isinstance(result, list)


def test_detect_sections_finds_experience() -> None:
    """detect_sections finds EXPERIENCE section per NLP-01"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    types = [s.type for s in sections]
    assert "experience" in types


def test_detect_sections_finds_education() -> None:
    """detect_sections finds EDUCATION section per NLP-01"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    types = [s.type for s in sections]
    assert "education" in types


def test_detect_sections_finds_skills() -> None:
    """detect_sections finds SKILLS section per NLP-01"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    types = [s.type for s in sections]
    assert "skills" in types


def test_detect_sections_finds_summary() -> None:
    """detect_sections finds SUMMARY section"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    types = [s.type for s in sections]
    assert "summary" in types


def test_detect_sections_returns_cv_section_objects() -> None:
    """Returned objects are CvSection instances"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    assert all(isinstance(s, CvSection) for s in sections)


def test_detect_sections_section_text_is_non_empty() -> None:
    """Each detected section has non-empty text"""
    sections = detect_sections(_CV_WITH_SECTIONS)
    assert all(s.text.strip() for s in sections)


def test_detect_sections_no_headings_returns_header() -> None:
    """CV with no section headings returns single header section"""
    sections = detect_sections(_CV_NO_SECTIONS)
    assert len(sections) == 1
    assert sections[0].type == "header"


def test_detect_sections_empty_text_returns_empty() -> None:
    """Empty text returns empty list"""
    sections = detect_sections("")
    assert sections == []


def test_detect_sections_colon_headings() -> None:
    """Section headings with trailing colon are detected"""
    sections = detect_sections(_CV_WITH_COLON_HEADINGS)
    types = [s.type for s in sections]
    assert "experience" in types or "education" in types

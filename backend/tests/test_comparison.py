"""Tests for comparison result schema per COMPARE-03, COMPARE-05, D-C6.
Wave 0 stub: FAILS until ComparisonResult added to backend/app/schemas/analysis.py (Wave 1).
"""

# This import will fail until ComparisonResult is added to analysis.py (Wave 1)
from app.schemas.analysis import ComparisonResult


VALID_COMPARISON = {
    "match_pct": 78,
    "matched_skills": ["Python", "FastAPI", "PostgreSQL"],
    "missing_skills": ["Kubernetes", "AWS"],
    "matched_experience": ["3 years backend dev", "REST API design"],
    "missing_experience": ["Team leadership", "Agile sprint planning"],
    "overall_recommendation": "Strong technical match.",
}


def test_comparison_result_schema_validates():
    result = ComparisonResult(**VALID_COMPARISON)
    assert result.match_pct == 78


def test_comparison_result_match_pct_is_int():
    result = ComparisonResult(**VALID_COMPARISON)
    assert isinstance(result.match_pct, int)
    assert 0 <= result.match_pct <= 100


def test_comparison_result_has_skills_gap_fields():
    result = ComparisonResult(**VALID_COMPARISON)
    assert isinstance(result.matched_skills, list)
    assert isinstance(result.missing_skills, list)
    assert "Python" in result.matched_skills
    assert "Kubernetes" in result.missing_skills


def test_comparison_result_has_experience_fields():
    result = ComparisonResult(**VALID_COMPARISON)
    assert isinstance(result.matched_experience, list)
    assert isinstance(result.missing_experience, list)


def test_comparison_result_has_recommendation():
    result = ComparisonResult(**VALID_COMPARISON)
    assert isinstance(result.overall_recommendation, str)
    assert len(result.overall_recommendation) > 0

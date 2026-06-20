"""Tests for CV scoring services (LLM-based scorer + deterministic metrics)."""

from unittest.mock import MagicMock, patch

from app.services.scoring.deterministic_metrics import (
    _action_verb_ratio,
    _contact_signals,
    _employment_gaps,
    _extract_bullets,
    _quantification_ratio,
    _section_coverage,
    compute_deterministic_metrics,
)
from app.services.scoring.embeddings import cosine_similarity
from app.services.scoring.llm_scorer import _median_int, _role_category
from app.services.scoring.scorer import score_cv

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_FAKE_LLM_RESULT = {
    "overall": 72,
    "impact": 70,
    "clarity": 75,
    "relevance": 68,
    "completeness": 80,
    "reasonings": {
        "impact": "Good measurable results shown.",
        "clarity": "Well structured and readable.",
        "relevance": "Skills match the target role.",
        "completeness": "All key sections present.",
    },
    "scoring_method": "llm",
    "provider": "koboi",
    "jd_relevance": False,
    "target_role": None,
    "ensemble_runs": 1,
    "score_ranges": {},
}


def _mock_score_cv(text: str, **kw) -> dict:
    """Run score_cv with LLM and settings mocked out."""
    with patch("app.core.config.get_settings") as mock_settings, patch(
        "app.services.scoring.llm_scorer.score_cv_with_llm",
        return_value=_FAKE_LLM_RESULT.copy(),
    ):
        mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
        mock_settings.return_value.CV_ANALYZER_SCORING_ENSEMBLE_RUNS = 1
        return score_cv(text, **kw)


# ---------------------------------------------------------------------------
# scorer.py integration
# ---------------------------------------------------------------------------

def test_score_cv_returns_dict_with_all_keys() -> None:
    result = _mock_score_cv("Sample CV text for testing")

    assert isinstance(result, dict)
    for key in ("overall", "clarity", "impact", "completeness", "relevance"):
        assert key in result, f"Missing key: {key}"


def test_score_cv_includes_metrics_and_reasonings() -> None:
    result = _mock_score_cv("Sample CV text for testing")

    assert "metrics" in result
    assert "reasonings" in result
    assert isinstance(result["metrics"], dict)


def test_score_cv_all_score_values_in_range() -> None:
    _NON_NUMERIC = {
        "scoring_method", "provider", "jd_relevance", "target_role",
        "benchmark", "reasonings", "metrics", "score_ranges", "ensemble_runs",
        "version_delta",
    }
    result = _mock_score_cv("Sample CV text")

    for key, value in result.items():
        if key in _NON_NUMERIC:
            continue
        assert isinstance(value, int), f"{key} should be int, got {type(value)}"
        assert 0 <= value <= 100, f"{key}={value} out of [0, 100]"


# ---------------------------------------------------------------------------
# llm_scorer helpers
# ---------------------------------------------------------------------------

def test_median_int_odd() -> None:
    assert _median_int([60, 70, 80]) == 70


def test_median_int_even() -> None:
    assert _median_int([60, 80]) == 70


def test_median_int_single() -> None:
    assert _median_int([75]) == 75


def test_role_category_design() -> None:
    assert _role_category("UI/UX Designer") == "design"
    assert _role_category("Brand Designer") == "design"


def test_role_category_marketing() -> None:
    assert _role_category("Marketing Manager") == "marketing"
    assert _role_category("SEO Specialist") == "marketing"


def test_role_category_management() -> None:
    assert _role_category("Product Manager") == "management"


def test_role_category_engineering_fallback() -> None:
    assert _role_category("Software Engineer") == "engineering"
    assert _role_category("Machine Learning Engineer") == "engineering"
    assert _role_category(None) == "general"


def test_role_category_data() -> None:
    assert _role_category("Data Scientist") == "data"
    assert _role_category("Data Analyst") == "data"
    assert _role_category("Data Engineer") == "data"
    assert _role_category("MLOps Engineer") == "data"
    assert _role_category("Analytics Engineer") == "data"


def test_role_category_devops() -> None:
    assert _role_category("DevOps Engineer") == "devops"
    assert _role_category("Site Reliability Engineer") == "devops"
    assert _role_category("Cloud Engineer") == "devops"


def test_role_category_finance() -> None:
    assert _role_category("Financial Analyst") == "finance"
    assert _role_category("Accountant") == "finance"
    assert _role_category("Audit Manager") == "finance"


# ---------------------------------------------------------------------------
# deterministic_metrics
# ---------------------------------------------------------------------------

_SAMPLE_CV = """\
John Doe | john@test.com | +628123456 | linkedin.com/in/johndoe

EXPERIENCE
Software Engineer - Startup (2022 - 2024)
- Developed REST API serving 50,000 daily active users
- Reduced query latency by 40% using Redis caching
- Led migration to microservices architecture

EDUCATION
B.Sc Computer Science (2018 - 2022)

SKILLS
Python, FastAPI, Docker
"""


def test_extract_bullets() -> None:
    bullets = _extract_bullets(_SAMPLE_CV)
    assert len(bullets) == 3
    assert all(isinstance(b, str) and len(b) > 0 for b in bullets)


def test_quantification_ratio() -> None:
    bullets = ["Increased revenue by 20%", "Led team", "Reduced cost by $50k"]
    assert _quantification_ratio(bullets) == round(2 / 3, 3)


def test_quantification_ratio_empty() -> None:
    assert _quantification_ratio([]) == 0.0


def test_action_verb_ratio_strong() -> None:
    bullets = ["Developed API", "Built system", "Assisted with tasks"]
    result = _action_verb_ratio(bullets)
    assert result["strong"] == 2
    assert result["weak"] == 1
    assert result["strong_ratio"] == round(2 / 3, 3)


def test_contact_signals_full() -> None:
    text = "john@test.com +628123456789 linkedin.com/in/johndoe"
    signals = _contact_signals(text)
    assert signals["has_email"] is True
    assert signals["has_phone"] is True
    assert signals["has_linkedin"] is True
    assert signals["has_github"] is False


def test_section_coverage_with_nlp() -> None:
    nlp = {"sections": [
        {"type": "experience"}, {"type": "education"},
        {"type": "skills"}, {"type": "contact"},
    ]}
    result = _section_coverage(nlp)
    assert "experience" in result["found"]
    assert result["score"] > 0


def test_employment_gaps_no_gap() -> None:
    text = "Software Engineer (2020 - 2022)\nSenior Engineer (2022 - 2024)"
    result = _employment_gaps(text)
    assert result["gaps_found"] == 0


def test_employment_gaps_detects_gap() -> None:
    text = "Engineer (2018 - 2019)\nSenior Engineer (2022 - 2024)"
    result = _employment_gaps(text)
    assert result["gaps_found"] >= 1
    assert result["longest_gap_months"] >= 36


def test_compute_deterministic_metrics_returns_all_keys() -> None:
    result = compute_deterministic_metrics(_SAMPLE_CV)
    for key in (
        "bullet_count", "word_count", "quantification_ratio", "action_verb_ratio",
        "passive_voice_ratio", "avg_bullet_length_words", "section_coverage",
        "skill_presence_in_experience", "employment_gaps", "contact_signals",
        "objective_score",
    ):
        assert key in result, f"Missing metric key: {key}"


def test_objective_score_in_range() -> None:
    result = compute_deterministic_metrics(_SAMPLE_CV)
    assert 0 <= result["objective_score"] <= 100


# ---------------------------------------------------------------------------
# embeddings utility (still present, used by other modules)
# ---------------------------------------------------------------------------

def test_cosine_similarity_same_vectors() -> None:
    vec = [0.5, 0.5, 0.5, 0.5]
    assert cosine_similarity(vec, vec) == 1.0


def test_cosine_similarity_zero_vector() -> None:
    vec = [0.0, 0.0, 0.0]
    assert cosine_similarity(vec, vec) == 0.0


# ---------------------------------------------------------------------------
# pytest import needed for approx
# ---------------------------------------------------------------------------
try:
    from pytest import approx as pytest_approx
except ImportError:
    def pytest_approx(x, **_):  # type: ignore[misc]
        return x

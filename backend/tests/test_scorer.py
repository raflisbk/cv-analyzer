"""Tests for SCORE-01..05: scoring services"""

from unittest.mock import patch

from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.hf_embeddings import cosine_similarity, score_dimension
from app.services.scoring.scorer import score_cv

# Fake embedding — same vector = cosine similarity of 1.0 -> score = 100
_FAKE_EMBEDDING = [0.1] * 1536


def test_score_cv_returns_dict_with_all_keys() -> None:
    """score_cv returns dict with all required keys per SCORE-01..05"""
    with patch("app.core.config.get_settings") as mock_settings:
        mock_settings.return_value.CV_ANALYZER_HF_API_KEY = "test-key"
        with patch(
            "app.services.scoring.hf_embeddings.get_embedding",
            return_value=_FAKE_EMBEDDING,
        ):
            result = score_cv("Sample CV text for testing")

    assert isinstance(result, dict)
    assert "overall" in result
    assert "clarity" in result
    assert "impact" in result
    assert "completeness" in result
    assert "relevance" in result


def test_score_cv_all_values_are_int_0_to_100() -> None:
    """All numeric score values are integers in range [0, 100] per SCORE-01"""
    _NON_NUMERIC_KEYS = {"scoring_method", "provider"}

    with patch("app.core.config.get_settings") as mock_settings:
        mock_settings.return_value.CV_ANALYZER_HF_API_KEY = "test-key"
        with patch(
            "app.services.scoring.hf_embeddings.get_embedding",
            return_value=_FAKE_EMBEDDING,
        ):
            result = score_cv("Sample CV text")

    for key, value in result.items():
        if key in _NON_NUMERIC_KEYS:
            continue
        assert isinstance(value, int), f"{key} should be int, got {type(value)}"
        assert 0 <= value <= 100, f"{key}={value} out of [0, 100] range"


def test_score_cv_overall_is_weighted_average() -> None:
    """overall is weighted average of 4 dimensions per SCORE-01"""
    # When all embeddings are identical -> cosine sim = 1.0 -> all dimension scores = 100
    # Overall = int(100*0.40 + 100*0.25 + 100*0.20 + 100*0.15) = 100
    with patch("app.core.config.get_settings") as mock_settings:
        mock_settings.return_value.CV_ANALYZER_HF_API_KEY = "test-key"
        with patch(
            "app.services.scoring.hf_embeddings.get_embedding",
            return_value=_FAKE_EMBEDDING,
        ):
            result = score_cv("Sample CV text")

    assert result["overall"] == 100


def test_cosine_similarity_same_vectors() -> None:
    """cosine_similarity of identical vectors is 1.0"""
    vec = [0.5, 0.5, 0.5, 0.5]
    assert cosine_similarity(vec, vec) == 1.0


def test_cosine_similarity_zero_vector() -> None:
    """cosine_similarity with zero vector returns 0.0 (no crash)"""
    vec = [0.0, 0.0, 0.0]
    assert cosine_similarity(vec, vec) == 0.0


def test_score_dimension_returns_int_0_to_100() -> None:
    """score_dimension returns integer in [0, 100]"""
    with patch(
        "app.services.scoring.hf_embeddings.get_embedding", return_value=_FAKE_EMBEDDING
    ):
        result = score_dimension("test text", ["anchor one", "anchor two"])

    assert isinstance(result, int)
    assert 0 <= result <= 100


def test_anchors_have_correct_count() -> None:
    """Each dimension has at least 4 anchor texts per D-08"""
    assert len(CLARITY_ANCHORS) >= 4
    assert len(IMPACT_ANCHORS) >= 4
    assert len(COMPLETENESS_ANCHORS) >= 4
    assert len(RELEVANCE_ANCHORS) >= 4


def test_anchors_are_non_empty_strings() -> None:
    """All anchor texts are non-empty strings"""
    all_anchors = (
        CLARITY_ANCHORS + IMPACT_ANCHORS + COMPLETENESS_ANCHORS + RELEVANCE_ANCHORS
    )
    for anchor in all_anchors:
        assert isinstance(anchor, str)
        assert len(anchor.strip()) > 50, f"Anchor too short: '{anchor[:30]}...'"

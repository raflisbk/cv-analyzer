import pytest

from app.services.progress.scores_event import (
    SCORE_DIMENSIONS,
    scores_ready_payload,
    summary_scores,
)

FULL_SCORES = {
    "overall": 71.6,
    "impact": 68,
    "clarity": 74,
    "relevance": 70,
    "completeness": 80,
    "reasonings": {"impact": "long text"},
    "benchmark": {"percentile": 40},
}


def test_summary_keeps_only_the_five_dimensions_as_integers():
    summary = summary_scores(FULL_SCORES)
    assert list(summary) == list(SCORE_DIMENSIONS)
    assert summary["overall"] == 71
    assert all(isinstance(value, int) for value in summary.values())


@pytest.mark.parametrize("empty", [None, {}, "text"])
def test_summary_is_none_when_scores_do_not_exist(empty):
    assert summary_scores(empty) is None


def test_summary_treats_missing_dimensions_as_zero():
    assert summary_scores({"overall": 50})["impact"] == 0


def test_payload_carries_stage_step_and_scores():
    payload = scores_ready_payload("job-1", FULL_SCORES)
    assert payload["stage"] == "scores_ready"
    assert payload["step"] == 3
    assert payload["steps"] == 5
    assert payload["job_id"] == "job-1"
    assert payload["scores"]["clarity"] == 74


def test_payload_is_none_without_scores():
    assert scores_ready_payload("job-1", None) is None

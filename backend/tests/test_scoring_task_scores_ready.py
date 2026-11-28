from unittest.mock import AsyncMock, patch

import pytest

from app.tasks.scoring import score_cv_task
from tests.pipeline_fakes import SCORES, EventRecorder, make_job, session_maker_for


def _run_scoring(job, recorder, scorer):
    with (
        patch("app.tasks.scoring.async_session_maker", session_maker_for(job)),
        patch("app.tasks.scoring.score_cv", scorer),
        patch("app.tasks.document_processing.redis_client", recorder.redis()),
        patch("app.tasks.scoring.mark_job_failed", AsyncMock()) as mark_failed,
    ):
        outcome = score_cv_task.run("job-1")
    return outcome, mark_failed


def _score_events(recorder):
    return [event for event in recorder.events if event["stage"] == "scores_ready"]


def test_scores_ready_is_published_once_after_scoring_with_integer_scores():
    recorder = EventRecorder()
    job = make_job()
    _run_scoring(job, recorder, lambda *a, **k: dict(SCORES))
    assert recorder.stages() == ["scoring", "scores_ready"]
    (event,) = _score_events(recorder)
    assert event["scores"] == {
        "overall": 72,
        "impact": 70,
        "clarity": 75,
        "relevance": 68,
        "completeness": 80,
    }
    assert (event["step"], event["steps"]) == (3, 5)


def test_scores_are_saved_before_the_event_is_published():
    recorder = EventRecorder()
    job = make_job()
    seen_at_publish = []
    original = recorder.publish

    def spy(channel, raw):
        seen_at_publish.append((raw, job.scores))
        original(channel, raw)

    fake = recorder.redis()
    fake.publish.side_effect = spy
    with (
        patch("app.tasks.scoring.async_session_maker", session_maker_for(job)),
        patch("app.tasks.scoring.score_cv", lambda *a, **k: dict(SCORES)),
        patch("app.tasks.document_processing.redis_client", fake),
    ):
        score_cv_task.run("job-1")
    ready_raw, scores_then = seen_at_publish[-1]
    assert "scores_ready" in ready_raw
    assert scores_then["overall"] == 72.4


def test_scores_ready_percentage_sits_between_scoring_and_grammar():
    recorder = EventRecorder()
    _run_scoring(make_job(), recorder, lambda *a, **k: dict(SCORES))
    percentages = [event["percentage"] for event in recorder.events]
    assert percentages == sorted(set(percentages))
    assert 62 < percentages[-1] < 76


def test_cached_scorer_result_still_emits_scores_ready_exactly_once():
    recorder = EventRecorder()
    cached = {**SCORES, "from_cache": True}
    _run_scoring(make_job(), recorder, lambda *a, **k: dict(cached))
    assert len(_score_events(recorder)) == 1


def test_scorer_failure_emits_no_scores_ready_and_reports_failure():
    recorder = EventRecorder()

    def broken(*args, **kwargs):
        raise RuntimeError("llm down")

    outcome, mark_failed = _run_scoring(make_job(), recorder, broken)
    assert _score_events(recorder) == []
    assert recorder.stages()[-1] == "failed"
    assert "llm down" in outcome["error"]
    mark_failed.assert_awaited_once()


def test_missing_cv_text_emits_no_scores_ready():
    recorder = EventRecorder()
    job = make_job(result=None)
    _run_scoring(job, recorder, lambda *a, **k: dict(SCORES))
    assert _score_events(recorder) == []
    assert recorder.stages()[-1] == "failed"

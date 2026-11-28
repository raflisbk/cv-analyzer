import time
from unittest.mock import AsyncMock, MagicMock, patch

from app.models.job import JobStatus
from app.services.llm.protocol import SuggestionsOutput
from app.tasks.grammar_check import grammar_check_task
from app.tasks.llm_suggest import llm_suggest_task
from app.tasks.scoring import score_cv_task
from tests.pipeline_fakes import SCORES, EventRecorder, make_job, session_maker_for

PHASE_SECONDS = {"score": 0.05, "grammar": 0.03, "suggest": 0.08}


def _slow(seconds, value):
    def call(*args, **kwargs):
        time.sleep(seconds)
        return value() if callable(value) else value

    return call


def _run_pipeline(recorder, job, suggest_fails=False):
    maker = session_maker_for(job)
    redis_cache = MagicMock()
    redis_cache.get.return_value = None
    suggestions = {"raw_json": "{}", "prompt_tokens": 1, "completion_tokens": 1}
    generate = (
        MagicMock(side_effect=RuntimeError("llm down"))
        if suggest_fails
        else _slow(PHASE_SECONDS["suggest"], suggestions)
    )
    validated = SuggestionsOutput.model_construct(suggestions=[])
    with (
        patch("app.tasks.document_processing.redis_client", recorder.redis()),
        patch("app.tasks.scoring.async_session_maker", maker),
        patch("app.tasks.grammar_check.async_session_maker", maker),
        patch("app.tasks.llm_suggest.async_session_maker", maker),
        patch(
            "app.tasks.scoring.score_cv",
            _slow(PHASE_SECONDS["score"], lambda: dict(SCORES)),
        ),
        patch(
            "app.tasks.grammar_check.check_grammar",
            _slow(PHASE_SECONDS["grammar"], []),
        ),
        patch("app.tasks.llm_suggest._get_redis_client", return_value=redis_cache),
        patch("app.tasks.llm_suggest._llm_service.generate_suggestions", generate),
        patch("app.tasks.llm_suggest.parse_suggestions", return_value=validated),
        patch("app.tasks.llm_suggest.get_rag_embedding", return_value=[0.0]),
        patch(
            "app.tasks.llm_suggest.retrieve_relevant_chunks",
            AsyncMock(return_value=[]),
        ),
        patch("app.tasks.llm_suggest.index_cv_sections", AsyncMock()),
        patch("app.tasks.llm_suggest.index_analysis_summary", AsyncMock()),
        patch("app.tasks.llm_suggest.build_cv_document", return_value={}),
    ):
        score_cv_task.run("job-1")
        grammar_check_task.run("job-1")
        llm_suggest_task.run("job-1")


def _print_timeline(recorder):
    print("\nstage                   pct step  t(s)")
    for event in recorder.events:
        print(
            f"{event['stage']:<22} {event['percentage']:>4} {event['step']:>4} "
            f"{event['at']:>6}"
        )


def test_scores_ready_arrives_before_grammar_and_suggestions_finish():
    recorder = EventRecorder()
    job = make_job()
    _run_pipeline(recorder, job)
    _print_timeline(recorder)
    stages = recorder.stages()
    assert stages.index("scores_ready") < stages.index("grammar_check")
    assert stages.index("scores_ready") < stages.index("generating_suggestions")
    assert stages.count("scores_ready") == 1
    assert stages[-1] == "complete"
    ready_at = recorder.events[stages.index("scores_ready")]["at"]
    assert ready_at < recorder.events[-1]["at"] - PHASE_SECONDS["suggest"]
    assert job.status == JobStatus.COMPLETE


def test_percentage_and_step_never_go_backwards_from_scoring_to_complete():
    recorder = EventRecorder()
    _run_pipeline(recorder, make_job())
    percentages = [event["percentage"] for event in recorder.events]
    steps = [event["step"] for event in recorder.events]
    assert percentages == sorted(percentages)
    assert steps == sorted(steps)
    assert percentages[-1] == 100


def test_failed_suggestions_still_complete_after_scores_ready():
    recorder = EventRecorder()
    job = make_job()
    _run_pipeline(recorder, job, suggest_fails=True)
    assert recorder.stages().index("scores_ready") < recorder.stages().index("complete")
    assert job.status == JobStatus.COMPLETE
    assert job.suggestions is None

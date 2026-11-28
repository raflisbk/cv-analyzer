import json
from unittest.mock import MagicMock, patch

from app.services.progress.stages import (
    PIPELINE_STAGES,
    indexing_message,
    indexing_percentage,
)
from app.tasks.document_processing import ProgressTask


def _run_simulated_pipeline(chunks: int) -> list[dict]:
    task = ProgressTask()
    fake_redis = MagicMock()
    with patch("app.tasks.document_processing.redis_client", fake_redis):
        for stage in PIPELINE_STAGES:
            if stage.name == "indexing_cv":
                for done in range(chunks + 1):
                    task.update_progress(
                        "job-1",
                        "indexing_cv",
                        indexing_percentage(done, chunks),
                        indexing_message(done, chunks),
                        done,
                        chunks,
                    )
                continue
            task.update_progress("job-1", stage.name, stage.percentage, stage.name)
    published = [call.args[1] for call in fake_redis.publish.call_args_list]
    return [json.loads(raw) for raw in published]


def test_percentage_never_goes_backwards_across_the_pipeline():
    percentages = [event["percentage"] for event in _run_simulated_pipeline(15)]
    assert percentages == sorted(percentages)
    assert percentages[-1] == 100


def test_step_never_goes_backwards_across_the_pipeline():
    steps = [event["step"] for event in _run_simulated_pipeline(15)]
    assert steps == sorted(steps)
    assert steps[-1] == 5


def test_every_event_carries_step_fields_and_job_id():
    for event in _run_simulated_pipeline(3):
        assert event["steps"] == 5
        assert event["job_id"] == "job-1"


def test_indexing_events_carry_real_counts():
    indexing = [
        event
        for event in _run_simulated_pipeline(15)
        if event["stage"] == "indexing_cv"
    ]
    assert [(e["done"], e["total"]) for e in indexing][:2] == [(0, 15), (1, 15)]
    assert indexing[-1]["message"] == "Indexing your CV (15/15)"


def test_update_progress_publishes_and_caches_the_same_payload():
    task = ProgressTask()
    fake_redis = MagicMock()
    with patch("app.tasks.document_processing.redis_client", fake_redis):
        task.update_progress("job-9", "scoring", 62, "Scoring CV with AI...")
    cached = fake_redis.setex.call_args.args[2]
    published = fake_redis.publish.call_args.args[1]
    assert cached == published
    assert fake_redis.publish.call_args.args[0] == "job:updates:job-9"
    assert json.loads(published)["step"] == 2

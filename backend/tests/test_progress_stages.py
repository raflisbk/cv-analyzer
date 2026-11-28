from app.services.progress.stages import (
    COMPLETE_STEP,
    PIPELINE_STAGES,
    STEP_COUNT,
    build_progress_payload,
    indexing_message,
    indexing_percentage,
    stage_percentage,
)

REAL_PIPELINE_STAGE_NAMES = [
    "extracting",
    "validating",
    "parsing",
    "analyzing_sections",
    "extracting_skills",
    "detecting_archetype",
    "scoring",
    "grammar_check",
    "indexing_cv",
    "generating_suggestions",
    "preparing_results",
    "complete",
]


def test_stage_order_matches_the_real_pipeline():
    assert [stage.name for stage in PIPELINE_STAGES] == REAL_PIPELINE_STAGE_NAMES


def test_table_percentages_strictly_increase():
    percentages = [stage.percentage for stage in PIPELINE_STAGES]
    assert percentages == sorted(set(percentages))
    assert percentages[-1] == 100


def test_steps_never_decrease_and_cover_zero_to_complete():
    steps = [stage.step for stage in PIPELINE_STAGES]
    assert steps == sorted(steps)
    assert steps[0] == 0
    assert steps[-1] == COMPLETE_STEP == STEP_COUNT


def test_each_backend_stage_maps_to_its_ui_step():
    expected = {
        "validating": 0,
        "parsing": 0,
        "analyzing_sections": 1,
        "extracting_skills": 1,
        "detecting_archetype": 1,
        "scoring": 2,
        "grammar_check": 3,
        "generating_suggestions": 4,
        "indexing_cv": 4,
        "preparing_results": 4,
        "complete": 5,
    }
    for stage, step in expected.items():
        assert build_progress_payload("job", stage, "m")["step"] == step


def test_payload_keeps_existing_fields_and_adds_step_fields():
    payload = build_progress_payload("job-1", "scoring", "Scoring CV with AI...")
    assert payload == {
        "stage": "scoring",
        "percentage": stage_percentage("scoring"),
        "message": "Scoring CV with AI...",
        "job_id": "job-1",
        "step": 2,
        "steps": STEP_COUNT,
    }


def test_explicit_percentage_overrides_table_value():
    assert build_progress_payload("job", "scoring", "m", 71)["percentage"] == 71


def test_counts_are_added_only_when_both_are_given():
    with_counts = build_progress_payload("job", "indexing_cv", "m", 81, 3, 15)
    assert (with_counts["done"], with_counts["total"]) == (3, 15)
    assert "done" not in build_progress_payload("job", "indexing_cv", "m", 81, 3)


def test_unknown_and_failed_stages_carry_no_step():
    for stage in ("failed", "comparing_job"):
        payload = build_progress_payload("job", stage, "m", 0)
        assert "step" not in payload
        assert "steps" not in payload


def test_indexing_percentage_stays_between_neighbouring_stages():
    low = stage_percentage("indexing_cv")
    high = stage_percentage("generating_suggestions")
    values = [indexing_percentage(done, 15) for done in range(16)]
    assert values == sorted(values)
    assert values[0] == low
    assert values[-1] < high


def test_indexing_percentage_handles_empty_total_and_overshoot():
    assert indexing_percentage(0, 0) == stage_percentage("indexing_cv")
    assert indexing_percentage(9, 3) == indexing_percentage(3, 3)


def test_indexing_message_carries_real_counts():
    assert indexing_message(7, 15) == "Indexing your CV (7/15)"

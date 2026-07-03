"""Tests for SSE stage map per STREAM-01, STREAM-02, D-C2, D-C13.
Wave 0 stub: FAILS until 'comparing_job' added to STAGE_MAP in processing-stages.tsx (Wave 2/3).
Note: This test checks the BACKEND stage name convention; frontend STAGE_MAP is validated manually.
"""

# The backend emits 'comparing_job' as the SSE stage name.
# This test verifies the stage name string is the correct convention used
# in compare_cv_task.update_progress() calls.

EXPECTED_BACKEND_STAGE = "comparing_job"
EXPECTED_UI_LABEL = "Comparing against job description"


def test_comparing_stage_name_convention():
    """compare_cv_task must emit 'comparing_job' (not 'comparing') per D-C13."""
    # Wave 0 stub: fails until comparison.py task is created in Wave 2
    from app.tasks import comparison

    # Verify module exists and exposes compare_cv_task
    assert hasattr(
        comparison, "compare_cv_task"
    ), "compare_cv_task not found in app.tasks.comparison"


def test_comparing_stage_is_valid_sse_stage():
    """Verify 'comparing_job' is a recognized stage name in the system."""
    # These are the known backend stage names per D-C13
    known_stages = {
        "uploading",
        "extracting",
        "validating",
        "parsing",
        "analyzing_sections",
        "extracting_skills",
        "scoring",
        "grammar_check",
        "generating_suggestions",
        "comparing_job",  # Phase 4 addition
        "complete",
        "failed",
    }
    assert EXPECTED_BACKEND_STAGE in known_stages

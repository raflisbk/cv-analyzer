import uuid
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest

from app.models.job import JobStatus
from app.schemas.job import JobResponse

SCORES = {
    "overall": 70,
    "impact": 60,
    "clarity": 75,
    "relevance": 65,
    "completeness": 80,
    "reasonings": {"impact": "text"},
    "benchmark": {"percentile": 50},
}


def _job(scores):
    now = datetime.now(UTC)
    return SimpleNamespace(
        id=uuid.uuid4(),
        status=JobStatus.ANALYZING,
        file_id="f",
        stages={},
        error=None,
        file_metadata={},
        result=None,
        scores=scores,
        created_at=now,
        updated_at=now,
    )


def test_scores_are_omitted_before_scoring_finished():
    assert JobResponse.model_validate(_job(None)).scores is None


def test_scores_expose_only_the_five_dimensions_once_saved():
    response = JobResponse.model_validate(_job(SCORES))
    assert response.scores == {
        "overall": 70,
        "impact": 60,
        "clarity": 75,
        "relevance": 65,
        "completeness": 80,
    }


def test_existing_fields_are_unchanged():
    dumped = JobResponse.model_validate(_job(SCORES)).model_dump()
    assert {"id", "status", "file_id", "stages", "error", "result"} <= set(dumped)


@pytest.mark.parametrize("empty", [None, {}])
def test_empty_scores_stay_null(empty):
    assert JobResponse.model_validate(_job(empty)).scores is None

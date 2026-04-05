"""Tests for D-23: GET /api/v1/jobs/{id}/results endpoint"""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def app():
    from app.main import app as fastapi_app  # noqa: PLC0415

    # Save existing overrides so module-level overrides from other test files are preserved
    saved_overrides = dict(fastapi_app.dependency_overrides)

    yield fastapi_app

    # Restore overrides exactly as they were before this test
    fastapi_app.dependency_overrides.clear()
    fastapi_app.dependency_overrides.update(saved_overrides)


@pytest.fixture
def client(app):
    return TestClient(app)


def _make_mock_session(job):
    """Create async DB session mock that returns the given job."""
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = job
    mock_session.execute.return_value = mock_result
    return mock_session


@pytest.fixture
def mock_complete_job():
    """Mock Job with all JSONB columns populated (status=COMPLETE)"""
    from app.models.job import JobStatus  # noqa: PLC0415

    job = MagicMock()
    job.id = uuid.uuid4()
    job.status = JobStatus.COMPLETE
    job.result = {"text": "John Doe\nSoftware Engineer", "metadata": {}}
    job.scores = {
        "overall": 78,
        "clarity": 82,
        "impact": 71,
        "completeness": 85,
        "relevance": 74,
    }
    job.nlp_result = {
        "sections": [
            {"type": "experience", "text": "Senior Engineer at Acme", "entities": []}
        ],
        "skills": ["Python", "FastAPI"],
        "entities": {
            "organizations": ["Acme Corp"],
            "dates": ["2021"],
            "persons": [],
            "locations": [],
        },
    }
    job.grammar_issues = [
        {"text": "recieve", "offset": 10, "suggestion": "receive", "rule": "SPELLING"}
    ]
    job.ats_checks = [
        {"check": "Standard sections present", "status": "pass", "detail": "OK"}
    ]
    return job


@pytest.fixture
def mock_processing_job():
    """Mock Job still processing (status=ANALYZING)"""
    from app.models.job import JobStatus  # noqa: PLC0415

    job = MagicMock()
    job.id = uuid.uuid4()
    job.status = JobStatus.ANALYZING
    job.result = None
    job.scores = None
    job.nlp_result = None
    job.grammar_issues = None
    job.ats_checks = None
    return job


def test_get_results_returns_200_for_complete_job(app, client, mock_complete_job):
    """GET /jobs/{id}/results returns 200 with full data for complete job per D-23"""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_complete_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_complete_job.id}/results")

    assert response.status_code == 200
    data = response.json()
    assert data["error"] is None
    assert data["data"] is not None


def test_get_results_response_has_correct_shape(app, client, mock_complete_job):
    """Response data has all required fields per D-23"""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_complete_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_complete_job.id}/results")

    result_data = response.json()["data"]
    for field in (
        "job_id",
        "status",
        "scores",
        "sections",
        "skills",
        "grammar_issues",
        "ats_checks",
    ):
        assert field in result_data


def test_get_results_scores_have_all_dimensions(app, client, mock_complete_job):
    """Scores contain all 5 dimensions per SCORE-01..05"""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_complete_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_complete_job.id}/results")

    scores = response.json()["data"]["scores"]
    assert scores["overall"] == 78
    assert scores["clarity"] == 82
    assert scores["impact"] == 71
    assert scores["completeness"] == 85
    assert scores["relevance"] == 74


def test_get_results_returns_error_for_unknown_job(app, client):
    """GET /jobs/{id}/results returns JOB_NOT_FOUND for non-existent job"""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(None)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get("/api/v1/jobs/nonexistent-job-id/results")

    data = response.json()
    assert data["error"] is not None
    assert data["error"]["code"] == "JOB_NOT_FOUND"


def test_get_results_processing_job_returns_200_with_empty_fields(
    app, client, mock_processing_job
):
    """Processing job returns 200 with status=analyzing and empty data fields"""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_processing_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_processing_job.id}/results")

    assert response.status_code == 200
    result_data = response.json()["data"]
    assert result_data["status"] == "analyzing"
    assert result_data["scores"] is None
    assert result_data["skills"] == []


def test_analysis_schemas_are_importable() -> None:
    """All analysis schemas are importable per D-23"""
    from app.schemas.analysis import (  # noqa: PLC0415
        AnalysisResult,
        AtsCheck,
        GrammarIssue,
        ScoreResult,
        SectionResult,
    )

    assert AnalysisResult is not None
    assert ScoreResult is not None
    assert SectionResult is not None
    assert GrammarIssue is not None
    assert AtsCheck is not None

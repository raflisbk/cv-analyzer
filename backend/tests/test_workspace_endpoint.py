"""Tests for GET /api/v1/jobs/{id}/workspace."""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def app():
    from app.main import app as fastapi_app  # noqa: PLC0415

    saved_overrides = dict(fastapi_app.dependency_overrides)

    yield fastapi_app

    fastapi_app.dependency_overrides.clear()
    fastapi_app.dependency_overrides.update(saved_overrides)


@pytest.fixture
def client(app):
    return TestClient(app)


def _make_mock_session(job):
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = job
    mock_session.execute.return_value = mock_result
    return mock_session


@pytest.fixture
def mock_ready_job():
    from app.models.job import JobStatus  # noqa: PLC0415

    job = MagicMock()
    job.id = uuid.uuid4()
    job.status = JobStatus.COMPLETE
    job.error = None
    job.file_metadata = {
        "filename": "resume.pdf",
        "mime_type": "application/pdf",
        "size": 2048,
        "extension": ".pdf",
    }
    job.result = {"text": "Jane Doe\nSenior Backend Engineer"}
    job.nlp_result = {
        "sections": [
            {
                "type": "experience",
                "text": "Senior Backend Engineer at Acme",
                "entities": [],
            }
        ]
    }
    job.scores = {
        "overall": 88,
        "clarity": 86,
        "impact": 84,
        "completeness": 91,
        "relevance": 89,
    }
    job.ats_checks = [
        {"check": "Uses standard headings", "status": "pass", "detail": "Looks good"}
    ]
    job.suggestions = [
        {
            "section": "experience",
            "suggestions": [
                {
                    "priority": "high_impact",
                    "text": "Add quantified outcomes.",
                    "type": "impact_metric",
                    "original_text": "Built services",
                    "after_text": "Built services used by 20K customers",
                }
            ],
        }
    ]
    job.comparison_result = {
        "match_pct": 77,
        "matched_skills": ["Python"],
        "missing_skills": ["Kubernetes"],
        "matched_experience": ["Backend APIs"],
        "missing_experience": ["Platform leadership"],
        "overall_recommendation": "Strong fit with room to improve platform depth.",
    }
    job.comparison_status = "complete"
    return job


@pytest.fixture
def mock_preparing_job():
    from app.models.job import JobStatus  # noqa: PLC0415

    job = MagicMock()
    job.id = uuid.uuid4()
    job.status = JobStatus.ANALYZING
    job.error = None
    job.file_metadata = {
        "filename": "draft.docx",
        "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size": 1024,
        "extension": ".docx",
    }
    job.result = None
    job.nlp_result = None
    job.scores = None
    job.ats_checks = None
    job.suggestions = None
    job.comparison_result = None
    job.comparison_status = None
    return job


@pytest.fixture
def mock_failed_job():
    from app.models.job import JobStatus  # noqa: PLC0415

    job = MagicMock()
    job.id = uuid.uuid4()
    job.status = JobStatus.FAILED
    job.error = "Document extraction failed."
    job.file_metadata = {
        "filename": "resume.pdf",
        "mime_type": "application/pdf",
        "size": 512,
        "extension": ".pdf",
    }
    job.result = None
    job.nlp_result = None
    job.scores = None
    job.ats_checks = None
    job.suggestions = None
    job.comparison_result = None
    job.comparison_status = None
    return job


def test_get_workspace_returns_ready_hydration_for_complete_job(
    app, client, mock_ready_job
):
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_ready_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_ready_job.id}/workspace")

    assert response.status_code == 200
    payload = response.json()

    assert payload["error"] is None
    assert payload["data"]["job_id"] == str(mock_ready_job.id)
    assert payload["data"]["status"] == "ready"
    assert payload["data"]["file"] == {
        "filename": "resume.pdf",
        "mime_type": "application/pdf",
        "size": 2048,
        "extension": ".pdf",
    }
    assert payload["data"]["document"]["source_text"] == "Jane Doe\nSenior Backend Engineer"
    assert payload["data"]["document"]["sections"][0]["type"] == "experience"
    assert payload["data"]["analysis"]["scores"]["overall"] == 88
    assert payload["data"]["analysis"]["ats_checks"][0]["status"] == "pass"
    assert payload["data"]["navigation"] == {
        "workspace_url": f"/workspace/{mock_ready_job.id}",
        "results_url": f"/results/{mock_ready_job.id}",
    }


def test_get_workspace_returns_preparing_without_auth_for_in_progress_job(
    app, client, mock_preparing_job
):
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_preparing_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_preparing_job.id}/workspace")

    assert response.status_code == 200
    payload = response.json()

    assert payload["error"] is None
    assert payload["data"]["status"] == "preparing"
    assert payload["data"]["navigation"] == {
        "workspace_url": f"/workspace/{mock_preparing_job.id}",
        "results_url": f"/results/{mock_preparing_job.id}",
    }


def test_get_workspace_returns_job_not_found(app, client):
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(None)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{uuid.uuid4()}/workspace")

    assert response.status_code == 200
    payload = response.json()

    assert payload["data"] is None
    assert payload["error"]["code"] == "JOB_NOT_FOUND"


def test_get_workspace_returns_failed_state_with_error_and_navigation(
    app, client, mock_failed_job
):
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        yield _make_mock_session(mock_failed_job)

    app.dependency_overrides[get_db] = override_get_db
    response = client.get(f"/api/v1/jobs/{mock_failed_job.id}/workspace")

    assert response.status_code == 200
    payload = response.json()

    assert payload["error"] is None
    assert payload["data"]["status"] == "failed"
    assert payload["data"]["job_error"] == "Document extraction failed."
    assert payload["data"]["navigation"] == {
        "workspace_url": f"/workspace/{mock_failed_job.id}",
        "results_url": f"/results/{mock_failed_job.id}",
    }


def test_workspace_schemas_are_importable() -> None:
    from app.schemas.workspace import (  # noqa: PLC0415
        WorkspaceAnalysisContext,
        WorkspaceDocumentPayload,
        WorkspaceFileInfo,
        WorkspaceHydration,
        WorkspaceNavigation,
    )

    assert WorkspaceHydration is not None
    assert WorkspaceFileInfo is not None
    assert WorkspaceDocumentPayload is not None
    assert WorkspaceAnalysisContext is not None
    assert WorkspaceNavigation is not None

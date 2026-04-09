"""Regression tests for PDF export endpoint per EXPORT-01, EXPORT-03, ERROR-04."""

import uuid
from pathlib import Path
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
    """Create async DB session mock that returns the given job."""
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = job
    mock_session.execute.return_value = mock_result
    return mock_session


def _make_completed_job():
    """Minimal completed-job stub required by export endpoint."""
    job = MagicMock()
    job.id = uuid.uuid4()
    job.file_metadata = {"filename": "cv.pdf"}
    job.scores = {"overall": 80}
    job.nlp_result = {"sections": [], "skills": []}
    job.grammar_issues = []
    job.ats_checks = []
    job.suggestions = []
    job.comparison_result = None
    job.comparison_status = None
    return job


def test_export_template_path_resolves_to_backend_app_templates() -> None:
    """Template directory must resolve to backend/app/templates and find report template."""
    from app.api.v1.endpoints import export as export_endpoint  # noqa: PLC0415

    expected_template_dir = (
        Path(export_endpoint.__file__).resolve().parents[3] / "templates"
    )
    assert export_endpoint._TEMPLATE_DIR == expected_template_dir
    assert (expected_template_dir / "cv_analysis_report.html").exists()
    assert (
        export_endpoint._jinja_env.get_template("cv_analysis_report.html") is not None
    )


def test_export_returns_safe_json_error_when_pdf_render_fails(app, client, monkeypatch):
    """Render failures must return non-200 JSON error, not fallback PDF bytes."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job()

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    def _raise_render_error(*_args, **_kwargs):
        raise TypeError("render failed")

    monkeypatch.setattr(
        "app.api.v1.endpoints.export.HTML.write_pdf",
        _raise_render_error,
    )

    response = client.get(f"/api/v1/jobs/{job.id}/export/pdf")

    assert response.status_code == 500
    assert response.headers["content-type"].startswith("application/json")
    payload = response.json()
    assert payload["data"] is None
    assert payload["error"]["code"] == "PDF_EXPORT_FAILED"
    assert (
        payload["error"]["message"] == "PDF generation failed. Please try again later."
    )

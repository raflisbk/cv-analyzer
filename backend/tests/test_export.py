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


def _make_completed_job(*, full: bool = True):
    """Minimal completed-job stub required by export endpoint."""
    job = MagicMock()
    job.id = uuid.uuid4()
    job.file_metadata = {"filename": "cv.pdf"}
    job.scores = {
        "overall": 80,
        "clarity": 75,
        "impact": 82,
        "completeness": 78,
        "relevance": 85,
    }
    job.nlp_result = {"sections": [], "skills": ["Python", "FastAPI"]}
    job.grammar_issues = (
        [{"text": "teh", "suggestion": "the", "rule": "SPELLING"}] if full else []
    )
    job.ats_checks = (
        [{"check": "Contact Info", "status": "pass", "detail": "Found email"}]
        if full
        else []
    )
    job.suggestions = (
        [
            {
                "section": "experience",
                "suggestions": [
                    {"text": "Add metrics to bullets.", "priority": "high_impact"}
                ],
            }
        ]
        if full
        else []
    )
    job.comparison_result = None
    job.comparison_status = None
    return job


# ---------------------------------------------------------------------------
# Template resolution
# ---------------------------------------------------------------------------


def test_export_template_path_resolves_to_backend_app_templates() -> None:
    """Template directory must resolve to backend/app/templates and find report template."""
    from app.api.v1.endpoints import export as export_endpoint  # noqa: PLC0415

    expected_template_dir = (
        Path(export_endpoint.__file__).resolve().parents[3] / "templates"
    )
    assert expected_template_dir == export_endpoint._TEMPLATE_DIR
    assert (expected_template_dir / "cv_analysis_report.html").exists()
    assert (
        export_endpoint._jinja_env.get_template("cv_analysis_report.html") is not None
    )


# ---------------------------------------------------------------------------
# 404 — job not found
# ---------------------------------------------------------------------------


def test_export_returns_404_when_job_not_found(app, client):
    """Missing job must return 404 with JOB_NOT_FOUND error code."""
    from app.db.session import get_db  # noqa: PLC0415

    async def override_get_db():
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db

    response = client.get(f"/api/v1/jobs/{uuid.uuid4()}/export/pdf")

    assert response.status_code == 404
    payload = response.json()
    assert payload["error"]["code"] == "JOB_NOT_FOUND"


# ---------------------------------------------------------------------------
# Successful PDF generation
# ---------------------------------------------------------------------------


def test_export_returns_pdf_bytes_with_correct_headers(app, client):
    """Export must return application/pdf with Content-Disposition attachment."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job(full=True)

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    response = client.get(f"/api/v1/jobs/{job.id}/export/pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment" in response.headers["content-disposition"]
    assert str(job.id)[:8] in response.headers["content-disposition"]


def test_export_pdf_content_is_valid_pdf(app, client):
    """Response body must start with PDF magic bytes %PDF."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job(full=True)

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    response = client.get(f"/api/v1/jobs/{job.id}/export/pdf")

    assert response.status_code == 200
    assert response.content[:4] == b"%PDF"
    assert len(response.content) > 1000  # real PDF, not empty


def test_export_pdf_with_partial_data(app, client):
    """Export must succeed when grammar, ATS, and suggestions are all empty."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job(full=False)

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    response = client.get(f"/api/v1/jobs/{job.id}/export/pdf")

    assert response.status_code == 200
    assert response.content[:4] == b"%PDF"


def test_export_pdf_with_comparison_result(app, client):
    """Export must include comparison section when comparison_result is present."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job(full=True)
    job.comparison_result = {
        "match_pct": 72,
        "matched_skills": ["Python"],
        "missing_skills": ["Kubernetes"],
        "recommendations": ["Add cloud experience"],
    }
    job.comparison_status = "complete"

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    response = client.get(f"/api/v1/jobs/{job.id}/export/pdf")

    assert response.status_code == 200
    assert response.content[:4] == b"%PDF"


# ---------------------------------------------------------------------------
# Error handling — PDF render failure
# ---------------------------------------------------------------------------


def test_export_returns_safe_json_error_when_pdf_render_fails(app, client, monkeypatch):
    """Render failures must return non-200 JSON error, not fallback PDF bytes."""
    from app.db.session import get_db  # noqa: PLC0415

    job = _make_completed_job()

    async def override_get_db():
        yield _make_mock_session(job)

    app.dependency_overrides[get_db] = override_get_db

    _err_msg = "render failed"

    def _raise_render_error(*_args, **_kwargs):
        raise TypeError(_err_msg)

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
    # Ensure no debug info leaks in production error response
    assert "Traceback" not in payload["error"]["message"]
    assert "TypeError" not in payload["error"]["message"]

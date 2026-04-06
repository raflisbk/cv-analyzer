"""Tests for PDF export endpoint per EXPORT-01, EXPORT-03, D-C11.
Wave 0 stub: FAILS until GET /api/v1/jobs/{id}/export/pdf implemented (Wave 2).
"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app.main import app  # noqa: PLC0415

    return TestClient(app)


def test_export_pdf_endpoint_exists(client):
    """GET /api/v1/jobs/{id}/export/pdf must exist (not 404)."""
    # Wave 0 stub: route not registered yet → returns 404 until Wave 2
    response = client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000/export/pdf")
    # After Wave 2: should return 404 (job not found) OR 200 (if test job exists)
    # NOT 404 due to missing route — route must be registered
    assert response.status_code != 404 or "JOB_NOT_FOUND" in response.text, (
        "Export endpoint not registered — add export router to api/v1/router.py"
    )


def test_export_pdf_content_type(client):
    """Export endpoint must return application/pdf Content-Type per EXPORT-01."""
    # Wave 0 stub: will fail until endpoint is implemented and a job exists
    pytest.skip("Requires a real job_id — implement after Wave 2 endpoint exists")

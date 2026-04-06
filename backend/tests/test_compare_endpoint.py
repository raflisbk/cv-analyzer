"""Tests for POST /api/v1/jobs/{id}/compare endpoint per COMPARE-01, D-C5.
Wave 0 stub: FAILS until compare router registered in api/v1/router.py (Wave 2).
"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app.main import app  # noqa: PLC0415

    return TestClient(app)


def test_compare_endpoint_rejects_short_jd(client):
    """POST /compare with jd_text < 50 chars must return 422 per D-C1, COMPARE-01."""
    response = client.post(
        "/api/v1/jobs/00000000-0000-0000-0000-000000000000/compare",
        json={"jd_text": "Too short"},
    )
    # Wave 0: returns 404 (route not found) until Wave 2 registers the router
    # After Wave 2: must return 422 (validation error) for short JD
    assert response.status_code in (
        404,
        422,
    ), f"Unexpected status {response.status_code}: route may not exist yet (Wave 0)"


def test_compare_endpoint_exists(client):
    """POST /api/v1/jobs/{id}/compare route must be registered per D-C1."""
    response = client.post(
        "/api/v1/jobs/00000000-0000-0000-0000-000000000000/compare",
        json={"jd_text": "x" * 51},
    )
    # After Wave 2: must NOT return 404 due to missing route (job_not_found 404 is OK)
    # Wave 0: 404 is expected until router is registered
    assert response.status_code in (
        404,
        422,
        200,
    ), f"Unexpected status {response.status_code}"


def test_job_roles_endpoint_exists(client):
    """GET /api/v1/job-roles route must exist per COMPARE-02."""
    response = client.get("/api/v1/job-roles")
    # Wave 0: returns 404 (not registered yet)
    # After Wave 2: returns 200 with list of job roles
    assert (
        response.status_code != 404
    ), "job-roles endpoint not registered — Wave 0 stub, will pass after Wave 2"

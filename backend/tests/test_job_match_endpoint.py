import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, require_user
from app.db.session import get_db
from app.main import app
from app.models.job import Job
from app.schemas.job_match import ExtractedRequirement, Extraction
from app.services.job_match import matcher
from app.services.job_match.extractor import JobMatchError

JD = "Python is required for this software engineering role at our company."


@pytest.fixture
def api(monkeypatch):
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()
    job = Job(id=uuid.uuid4(), user_id=owner, file_id="file", result={"text": "Python"})
    db = AsyncMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = job
    db.execute.return_value = result

    async def db_override():
        yield db

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: SimpleNamespace(id=owner)
    monkeypatch.setattr(matcher, "cached_match", lambda key: None)
    monkeypatch.setattr(matcher, "store_match", lambda *args: None)
    monkeypatch.setattr(
        matcher,
        "extract_requirements",
        lambda *args: Extraction(requirements=[]),
    )
    yield TestClient(app), job
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def post(client, job, text=JD):
    return client.post(
        f"/api/v1/jobs/{job.id}/job-match", json={"jobDescription": text}
    )


def test_requires_login(api):
    client, job = api
    app.dependency_overrides.pop(require_user)
    app.dependency_overrides[get_current_user] = lambda: None
    assert post(client, job).status_code == 401


def test_hides_other_users_job(api):
    client, job = api
    job.user_id = uuid.uuid4()
    assert post(client, job).status_code == 404


@pytest.mark.parametrize("length", [49, 6001])
def test_jd_length_limits(api, length):
    client, job = api
    assert post(client, job, "x" * length).status_code == 422


def test_response_shape_matches_frontend_types(api, monkeypatch):
    client, job = api
    monkeypatch.setattr(
        matcher,
        "extract_requirements",
        lambda *args: Extraction(
            requirements=[
                ExtractedRequirement(
                    label="Python",
                    weight="must",
                    category="skills",
                    status="met",
                    evidence_quote="Python",
                )
            ]
        ),
    )
    response = post(client, job)
    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data) == {"score", "headline", "summary", "dimensions", "requirements"}
    assert set(data["dimensions"][0]) == {"key", "score"}
    assert set(data["requirements"][0]) == {"label", "weight", "status", "evidence"}


def test_llm_failure_returns_error_envelope(api, monkeypatch):
    client, job = api

    def fail(*args):
        raise JobMatchError("failure")

    monkeypatch.setattr(matcher, "extract_requirements", fail)
    response = post(client, job)
    assert response.json()["error"]["code"] == "JOB_MATCH_FAILED"
    assert response.json()["data"] is None


def test_rate_limit_is_per_user(api):
    client, job = api
    assert all(post(client, job).status_code == 200 for _ in range(10))
    assert post(client, job).status_code == 429

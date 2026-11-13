import uuid
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app
from app.models.job import Job


@pytest.fixture
def api():
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()
    jobs = []
    session = AsyncMock()
    result = MagicMock()
    result.scalars.return_value.all.side_effect = lambda: jobs
    session.execute.return_value = result

    async def db_override():
        yield session

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: SimpleNamespace(id=owner)
    yield TestClient(app), owner, jobs
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def job_for(owner):
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        file_id="file",
        file_metadata={"filename": "cv.pdf"},
        result={"text": "CV text"},
        scores={
            "overall": 70,
            "impact": 60,
            "clarity": 80,
            "relevance": 70,
            "completeness": 90,
        },
        suggestions=[],
        nlp_result={"sections": [], "skills": []},
    )
    job.updated_at = datetime(2026, 11, 14, tzinfo=UTC)
    return job


@pytest.mark.parametrize(
    "tail", ["report", "versions", f"versions/{uuid.uuid4()}/diff"]
)
def test_routes_require_login(api, tail):
    client, _, _ = api
    app.dependency_overrides.pop(require_user)
    assert client.get(f"/api/v1/jobs/{uuid.uuid4()}/{tail}").status_code == 401


@pytest.mark.parametrize(
    "tail", ["report", "versions", f"versions/{uuid.uuid4()}/diff"]
)
def test_other_owner_gets_404(api, tail):
    client, _, jobs = api
    other = job_for(uuid.uuid4())
    jobs.append(other)
    assert client.get(f"/api/v1/jobs/{other.id}/{tail}").status_code == 404


def test_report_shape_matches_frontend_contract(api):
    client, owner, jobs = api
    job = job_for(owner)
    jobs.append(job)
    response = client.get(f"/api/v1/jobs/{job.id}/report")
    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data) == {
        "fileName",
        "role",
        "version",
        "score",
        "previousScore",
        "projectedScore",
        "verdict",
        "topPercent",
        "facts",
        "fixes",
        "dimensions",
        "sections",
        "bullets",
        "grammar",
        "keywords",
        "ats",
        "versions",
    }
    assert set(data["dimensions"][0]) == {
        "key",
        "score",
        "previous",
        "projected",
        "description",
        "metrics",
        "hint",
        "evidence",
    }
    assert set(data["grammar"]) == {"spelling", "grammar", "style", "notes"}
    assert set(data["keywords"]) == {"present", "missing", "total"}
    assert set(data["ats"]) == {"score", "facts", "checks"}
    assert set(data["verdict"]) == {"title", "body"}
    assert set(data["versions"][0]) == {"label", "score", "at", "summary"}


def test_nested_report_shapes_match_frontend_contract(api):
    client, owner, jobs = api
    job = job_for(owner)
    job.result = {"text": "Acme built tools for teams"}
    job.nlp_result = {
        "sections": [{"type": "experience", "text": "Acme\n- Built 3 tools for teams"}],
        "skills": ["tools"],
    }
    job.suggestions = [
        {
            "suggestions": [
                {
                    "type": "impact_metric",
                    "text": "Add evidence",
                    "original_text": "Built 3 tools for teams",
                }
            ]
        }
    ]
    job.grammar_issues = [{"rule": "SPELLING", "text": "teh", "suggestion": "the"}]
    job.ats_checks = [{"check": "Readable text", "status": "pass"}]
    jobs.append(job)
    data = client.get(f"/api/v1/jobs/{job.id}/report").json()["data"]
    assert set(data["fixes"][0]) == {"title", "text", "points"}
    assert set(data["sections"][0]) == {"name", "score", "note"}
    assert set(data["bullets"][0]) == {"text", "source", "strength", "tags"}
    assert set(data["grammar"]["notes"][0]) == {"before", "after", "location"}
    assert set(data["keywords"]["present"][0]) == {"name", "count"}
    assert set(data["ats"]["checks"][0]) == {"text", "ok"}
    assert set(data["dimensions"][0]["metrics"][0]) == {"label", "value", "percent"}
    assert set(data["dimensions"][0]["evidence"][0]) == {"text", "note", "positive"}


def test_versions_and_diff_shapes(api):
    client, owner, jobs = api
    first = job_for(owner)
    second = job_for(owner)
    second.parent_job_id = first.id
    second.result = {"text": "Updated CV"}
    jobs.extend([first, second])
    history = client.get(f"/api/v1/jobs/{second.id}/versions").json()["data"]
    diff = client.get(f"/api/v1/jobs/{second.id}/versions/{second.id}/diff").json()[
        "data"
    ]
    assert set(history[0]) == {
        "id",
        "label",
        "at",
        "score",
        "delta",
        "summary",
        "current",
    }
    assert history[0]["delta"] is None
    assert diff == {"before": "CV text", "after": "Updated CV"}


def test_diff_rejects_unrelated_version(api):
    client, owner, jobs = api
    first = job_for(owner)
    unrelated = job_for(owner)
    jobs.extend([first, unrelated])
    assert (
        client.get(f"/api/v1/jobs/{first.id}/versions/{unrelated.id}/diff").status_code
        == 404
    )

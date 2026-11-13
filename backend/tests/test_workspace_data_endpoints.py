import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, require_user
from app.db.session import get_db
from app.main import app
from app.models.job import Job
from app.services.workspace_data.grammar_view import note_id


@pytest.fixture
def api():
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        file_id="file",
        result={"text": "Summary\nAda wrote code.\nExperience\nrecieve"},
        scores={"ats_score": 80},
        ats_checks=[
            {"check": "No tables detected", "status": "pass", "detail": "Clear"}
        ],
        grammar_issues=[
            {
                "text": "recieve",
                "offset": 36,
                "suggestion": "receive",
                "rule": "SPELLING",
            }
        ],
    )
    db = AsyncMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = job
    db.execute.return_value = result

    async def db_override():
        yield db

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: SimpleNamespace(id=owner)
    yield TestClient(app), owner, job, db, result
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def paths(job):
    root = f"/api/v1/jobs/{job.id}"
    note = note_id(job.grammar_issues[0])
    return [
        ("get", f"{root}/ats"),
        ("get", f"{root}/grammar"),
        ("post", f"{root}/grammar/{note}/accept"),
        ("post", f"{root}/grammar/{note}/ignore"),
    ]


def test_all_routes_require_login(api):
    client, _, job, _, _ = api
    app.dependency_overrides.pop(require_user)
    app.dependency_overrides[get_current_user] = lambda: None
    for method, path in paths(job):
        assert getattr(client, method)(path).status_code == 401


def test_all_routes_hide_other_users_job(api):
    client, _, job, _, _ = api
    job.user_id = uuid.uuid4()
    for method, path in paths(job):
        assert getattr(client, method)(path).status_code == 404


def test_ats_response_matches_frontend_shape(api):
    client, _, job, _, _ = api
    data = client.get(f"/api/v1/jobs/{job.id}/ats").json()["data"]
    assert set(data) == {
        "score",
        "summary",
        "compat",
        "parsed",
        "plainText",
        "checks",
        "hiddenText",
    }
    assert set(data["checks"][0]) == {"group", "label", "status"}
    assert set(data["parsed"][0]) == {"field", "value", "confidence"}
    assert set(data["plainText"]) == {"lines", "note"}
    assert set(data["hiddenText"]) == {"found", "items"}


def test_grammar_response_matches_frontend_shape(api):
    client, _, job, _, _ = api
    data = client.get(f"/api/v1/jobs/{job.id}/grammar").json()["data"]
    assert set(data) == {"stats", "notes"}
    assert set(data["stats"]) == {
        "readingGrade",
        "wordsPerSentence",
        "passiveLines",
        "tone",
    }
    assert set(data["notes"][0]) == {"id", "type", "location", "before", "after"}


@pytest.mark.parametrize(
    ("action", "status"), [("accept", "accepted"), ("ignore", "ignored")]
)
def test_decision_persists_and_hides_note(api, action, status):
    client, _, job, db, _ = api
    path = f"/api/v1/jobs/{job.id}/grammar/{note_id(job.grammar_issues[0])}/{action}"
    response = client.post(path)
    assert response.status_code == 200
    assert response.json()["data"]["notes"] == []
    assert job.grammar_issues[0]["status"] == status
    db.commit.assert_awaited_once()


def test_unknown_note_returns_404(api):
    client, _, job, db, _ = api
    response = client.post(f"/api/v1/jobs/{job.id}/grammar/unknown/accept")
    assert response.status_code == 404
    db.commit.assert_not_awaited()


def test_repeating_decision_is_idempotent(api):
    client, _, job, db, _ = api
    path = f"/api/v1/jobs/{job.id}/grammar/{note_id(job.grammar_issues[0])}/accept"
    assert client.post(path).status_code == 200
    assert client.post(path).status_code == 200
    assert job.grammar_issues[0]["status"] == "accepted"
    assert db.commit.await_count == 2


def test_job_without_analysis_has_empty_valid_responses(api):
    client, _, job, _, _ = api
    job.result = None
    job.scores = None
    job.ats_checks = None
    job.grammar_issues = None
    ats = client.get(f"/api/v1/jobs/{job.id}/ats").json()["data"]
    grammar = client.get(f"/api/v1/jobs/{job.id}/grammar").json()["data"]
    assert ats["score"] == 0
    assert ats["compat"] == []
    assert grammar["notes"] == []

import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app
from app.models.job import Job, JobStatus


def make_job(owner, *, parent=None, status=JobStatus.COMPLETE, score=70, days=0):
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        parent_job_id=parent,
        status=status,
        file_id="file",
        file_metadata={"filename": "resume.pdf", "size": 2048, "pages": 2},
        target_role="Engineer",
        scores={
            "overall": score,
            "impact": 60,
            "clarity": 80,
            "relevance": 70,
            "completeness": 90,
        },
        nlp_result={"word_count": 120, "sections": []},
        suggestions=[],
    )
    job.updated_at = datetime(2026, 11, 14, tzinfo=UTC) - timedelta(days=days)
    return job


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
    yield TestClient(app), owner, jobs, session
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def test_cvs_excludes_other_and_anonymous_jobs(api):
    client, owner, jobs, session = api
    jobs.extend([make_job(owner), make_job(uuid.uuid4()), make_job(None)])
    assert len(client.get("/api/v1/cvs").json()["data"]) == 1
    assert session.execute.await_count == 1


@pytest.mark.parametrize("path", ["/api/v1/cvs", "/api/v1/reports"])
def test_lists_require_login(api, path):
    client, _, _, _ = api
    app.dependency_overrides.pop(require_user)
    assert client.get(path).status_code == 401


def test_cvs_lists_only_latest_version_with_exact_keys(api):
    client, owner, jobs, _ = api
    first = make_job(owner, days=2)
    second = make_job(owner, parent=first.id)
    jobs.extend([first, second])
    data = client.get("/api/v1/cvs").json()["data"]
    assert len(data) == 1
    assert data[0]["jobId"] == str(second.id)
    assert set(data[0]) == {
        "jobId",
        "fileName",
        "targetRole",
        "score",
        "status",
        "updatedAt",
        "pages",
        "wordCount",
    }
    assert (data[0]["pages"], data[0]["wordCount"], data[0]["status"]) == (
        2,
        120,
        "complete",
    )
    assert isinstance(data[0]["updatedAt"], str)
    assert isinstance(data[0]["score"], (int, float))


def test_reports_version_order_and_empty_top_fix(api):
    client, owner, jobs, _ = api
    first = make_job(owner, score=50, days=2)
    second = make_job(owner, parent=first.id, score=70)
    jobs.extend([first, second])
    report = client.get("/api/v1/reports").json()["data"]["reports"][0]
    assert report["versions"] == [
        {"label": "v1", "score": 50, "at": first.updated_at.isoformat()},
        {"label": "v2", "score": 70, "at": second.updated_at.isoformat()},
    ]
    assert report["topFix"] == ""
    assert set(report) == {
        "jobId",
        "fileName",
        "role",
        "analyzedAt",
        "score",
        "dimensions",
        "versions",
        "topFix",
        "fileFacts",
    }
    assert set(report["fileFacts"]) == {"type", "pages", "sizeKb", "bullets"}
    assert set(report["dimensions"]) == {
        "impact",
        "clarity",
        "relevance",
        "completeness",
    }
    assert all(
        isinstance(value, (int, float)) for value in report["dimensions"].values()
    )


def test_reports_aggregate_known_values(api):
    client, owner, jobs, _ = api
    first = make_job(owner, score=60, days=1)
    second = make_job(owner, score=80)
    second.scores["impact"] = 80
    first.suggestions = [
        {
            "suggestions": [
                {
                    "type": "impact_metric",
                    "text": "Add outcome",
                    "priority": "high_impact",
                }
            ]
        }
    ]
    jobs.extend([first, second])
    aggregate = client.get("/api/v1/reports").json()["data"]["aggregate"]
    assert aggregate["count"] == 2
    assert aggregate["bestScore"] == 80
    assert aggregate["averageImpact"] == 70
    assert aggregate["averageByDimension"] == {
        "impact": 70,
        "clarity": 80,
        "relevance": 70,
        "completeness": 90,
    }
    assert aggregate["openFixes"] == 1
    assert aggregate["lastAnalysisAt"] == second.updated_at.isoformat()


def test_reports_empty_state(api):
    client, _, _, _ = api
    data = client.get("/api/v1/reports").json()["data"]
    assert data["reports"] == []
    assert data["aggregate"]["count"] == 0
    assert data["aggregate"]["lastAnalysisAt"] == ""
    assert data["aggregate"]["recurringFixes"] == []


def test_reports_exclude_other_users_and_unscored_jobs(api):
    client, owner, jobs, _ = api
    unscored = make_job(owner)
    unscored.scores = None
    jobs.extend([make_job(uuid.uuid4()), make_job(None), unscored])
    assert client.get("/api/v1/reports").json()["data"]["reports"] == []


def test_recurring_fixes_rank_by_weight_and_limit_to_three(api):
    client, owner, jobs, _ = api
    low = make_job(owner)
    high = make_job(owner, days=1)
    low.scores.update(impact=20, clarity=80, completeness=60)
    high.scores.update(impact=80, clarity=40, completeness=80)
    low.suggestions = [
        {
            "suggestions": [
                {"type": "impact_metric", "text": "Add outcome"},
                {"type": "impact_metric", "text": "Add another outcome"},
                {"type": "missing_section", "text": "Add projects"},
            ]
        }
    ]
    high.suggestions = [
        {
            "suggestions": [
                {"type": "impact_metric", "text": "Show result"},
                {"type": "action_verb", "text": "Use active verb"},
                {"type": "unknown", "text": "Ignore"},
            ]
        }
    ]
    jobs.extend([low, high])
    fixes = client.get("/api/v1/reports").json()["data"]["aggregate"]["recurringFixes"]
    assert [(fix["dimension"], fix["cvCount"]) for fix in fixes] == [
        ("Impact", 2),
        ("Clarity", 1),
        ("Completeness", 1),
    ]
    assert fixes[0]["text"] in {"Add outcome", "Show result"}


def test_missing_metadata_uses_zero_values(api):
    client, owner, jobs, _ = api
    job = make_job(owner)
    job.file_metadata = {}
    job.nlp_result = None
    jobs.append(job)
    cv = client.get("/api/v1/cvs").json()["data"][0]
    report = client.get("/api/v1/reports").json()["data"]["reports"][0]
    assert (cv["pages"], cv["wordCount"]) == (0, 0)
    assert report["fileFacts"] == {"type": "", "pages": 0, "sizeKb": 0, "bullets": 0}

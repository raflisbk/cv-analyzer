import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app
from app.models.job import Job, JobStatus
from app.services.versions_restore.chain import MAX_CHAIN_LENGTH

BASE_TIME = datetime(2026, 11, 1, tzinfo=UTC)


@pytest.fixture
def api():
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()
    jobs = []
    session = AsyncMock()
    session.add = MagicMock()
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


def make_job(owner, parent=None, index=0, text="CV text"):
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        status=JobStatus.COMPLETE,
        file_id=f"file-{index}",
        file_metadata={"filename": f"cv-{index}.pdf"},
        scores={"overall": 60 + index},
        suggestions=[{"id": f"s{index}"}],
        suggestion_anchors={"anchor": index},
        nlp_result={"skills": [f"skill-{index}"]},
        cv_document={"text": text},
        parent_job_id=parent.id if parent else None,
    )
    job.created_at = BASE_TIME + timedelta(days=index)
    return job


def chain_of(owner, length):
    jobs = []
    for index in range(length):
        jobs.append(make_job(owner, jobs[-1] if jobs else None, index, f"text {index}"))
    return jobs


def restore_url(job, version):
    return f"/api/v1/jobs/{job.id}/versions/{version.id}/restore"


def test_requires_login(api):
    client, owner, jobs, _ = api
    app.dependency_overrides.pop(require_user)
    jobs.extend(chain_of(owner, 2))
    assert client.post(restore_url(jobs[1], jobs[0])).status_code == 401


def test_other_owner_gets_404(api):
    client, _, jobs, session = api
    foreign = chain_of(uuid.uuid4(), 2)
    jobs.extend(foreign)
    assert client.post(restore_url(foreign[1], foreign[0])).status_code == 404
    session.add.assert_not_called()


def test_version_outside_chain_gets_404(api):
    client, owner, jobs, session = api
    mine = chain_of(owner, 2)
    stranger = make_job(owner, index=9)
    jobs.extend([*mine, stranger])
    assert client.post(restore_url(mine[1], stranger)).status_code == 404
    session.add.assert_not_called()


def test_restore_copies_content_and_links_parent(api):
    client, owner, jobs, session = api
    chain = chain_of(owner, 3)
    jobs.extend(chain)
    response = client.post(restore_url(chain[2], chain[0]))
    assert response.status_code == 200
    created = session.add.call_args.args[0]
    assert response.json()["data"] == {"jobId": str(created.id), "version": "v4"}
    assert created.parent_job_id == chain[2].id
    assert created.status == JobStatus.COMPLETE
    assert created.user_id == owner
    for field in ("file_id", "scores", "suggestions", "suggestion_anchors"):
        assert getattr(created, field) == getattr(chain[0], field)
    assert created.cv_document == chain[0].cv_document
    assert created.nlp_result == chain[0].nlp_result


def test_restore_leaves_existing_versions_untouched(api):
    client, owner, jobs, _ = api
    chain = chain_of(owner, 3)
    jobs.extend(chain)
    before = [(job.cv_document, job.parent_job_id, job.scores) for job in chain]
    client.post(restore_url(chain[2], chain[1]))
    assert before == [(job.cv_document, job.parent_job_id, job.scores) for job in chain]


def test_restore_from_older_job_targets_latest_tip(api):
    client, owner, jobs, session = api
    chain = chain_of(owner, 3)
    jobs.extend(chain)
    assert client.post(restore_url(chain[0], chain[1])).status_code == 200
    assert session.add.call_args.args[0].parent_job_id == chain[2].id


def test_restoring_latest_version_is_409(api):
    client, owner, jobs, session = api
    chain = chain_of(owner, 2)
    jobs.extend(chain)
    assert client.post(restore_url(chain[1], chain[1])).status_code == 409
    session.add.assert_not_called()


def test_chain_cap_is_409(api):
    client, owner, jobs, session = api
    chain = chain_of(owner, MAX_CHAIN_LENGTH)
    jobs.extend(chain)
    assert client.post(restore_url(chain[-1], chain[0])).status_code == 409
    session.add.assert_not_called()


def test_restore_starts_no_task_and_no_llm(api):
    client, owner, jobs, _ = api
    chain = chain_of(owner, 2)
    jobs.extend(chain)
    with (
        patch("app.core.background.spawn") as spawn,
        patch("app.services.llm.koboi_llm_service.KoboiLLMService._chat") as llm,
    ):
        assert client.post(restore_url(chain[1], chain[0])).status_code == 200
    spawn.assert_not_called()
    llm.assert_not_called()

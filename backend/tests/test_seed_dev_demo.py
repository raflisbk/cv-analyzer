import uuid

import pytest

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job, JobStatus
from app.models.user import User
from app.services.llm.protocol import SuggestionsOutput
from scripts.seed_demo.builders import WEIGHTS, build_jobs
from scripts.seed_dev_demo import ensure_dev_environment, run, seed


class Result:
    def __init__(self, values):
        self.values = values

    def scalar_one_or_none(self):
        return self.values[0] if self.values else None

    def scalars(self):
        return self

    def all(self):
        return self.values


class MemorySession:
    def __init__(self):
        self.objects = []
        self.commits = 0

    def add(self, obj):
        self.objects.append(obj)

    async def execute(self, statement):
        entity = statement.column_descriptions[0]["entity"]
        if entity is User:
            return Result([obj for obj in self.objects if isinstance(obj, User)])
        return Result([obj.id for obj in self.objects if isinstance(obj, entity)])

    async def commit(self):
        self.commits += 1


@pytest.mark.parametrize(
    ("environment", "host"),
    [("production", "localhost"), ("development", "remote.example")],
)
def test_seed_refuses_unsafe_environment(environment, host):
    with pytest.raises(RuntimeError):
        ensure_dev_environment(environment, host)


@pytest.mark.asyncio
async def test_run_refuses_production_before_database_access(monkeypatch):
    monkeypatch.setenv("CV_ANALYZER_ENV", "production")
    monkeypatch.setenv("CV_ANALYZER_DB_HOST", "localhost")
    with pytest.raises(RuntimeError):
        await run("demo@example.test")


@pytest.mark.asyncio
async def test_seed_is_idempotent():
    session = MemorySession()
    first = await seed(session, "demo@example.test")
    second = await seed(session, "demo@example.test")
    assert [job.id for job in first] == [job.id for job in second]
    assert [
        sum(isinstance(obj, kind) for obj in session.objects)
        for kind in (User, Job, Conversation, ConversationMessage)
    ] == [1, 4, 2, 6]
    assert session.commits == 2


def test_seeded_scores_follow_weights_and_versions():
    jobs = build_jobs(uuid.uuid4(), "demo@example.test")
    assert [job.status for job in jobs] == [JobStatus.COMPLETE] * 4
    assert all(job.file_id == "" for job in jobs)
    assert [job.parent_job_id for job in jobs] == [None, jobs[0].id, jobs[1].id, None]
    assert [job.scores["overall"] for job in jobs] == [52, 68, 81, 74]
    for job in jobs:
        expected = round(
            sum(job.scores[key] * weight for key, weight in WEIGHTS.items()) / 100
        )
        assert job.scores["overall"] == expected


def test_seeded_placeholder_suggestions_survive_result_validation():
    job = build_jobs(uuid.uuid4(), "demo@example.test")[2]
    cards = SuggestionsOutput.model_validate(
        {"suggestions": job.suggestions}, context={"cv_text": job.result["text"]}
    )
    items = cards.suggestions[0].suggestions
    assert [item.needs_input[0].token for item in items] == [
        "[how many?]",
        "[which team?]",
    ]

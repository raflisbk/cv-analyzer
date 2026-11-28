import json
import time
from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from app.models.job import JobStatus

CV_TEXT = "Jane Doe\nSenior engineer\nBuilt services serving 2M users."
SECTIONS = [{"type": "experience", "text": "Built services serving 2M users."}]
SCORES = {
    "overall": 72.4,
    "impact": 70,
    "clarity": 75,
    "relevance": 68,
    "completeness": 80,
    "reasonings": {"impact": "ok"},
}


def make_job(**overrides):
    fields = {
        "id": "job-1",
        "result": {"text": CV_TEXT, "metadata": {}},
        "jd_text": None,
        "target_role": None,
        "nlp_result": {"sections": SECTIONS, "detected_role": "Engineer"},
        "parent_job_id": None,
        "scores": None,
        "grammar_issues": None,
        "ats_checks": None,
        "status": JobStatus.ANALYZING,
        "file_id": "",
        "user_id": None,
        "suggestions": None,
        "llm_tokens_used": 0,
        "cv_document": None,
        "error": None,
    }
    fields.update(overrides)
    return SimpleNamespace(**fields)


def session_maker_for(job):
    session = MagicMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = job
    result.scalar.return_value = 0
    session.execute = AsyncMock(return_value=result)
    session.commit = AsyncMock()

    @asynccontextmanager
    async def maker():
        yield session

    return maker


class EventRecorder:
    def __init__(self):
        self.events = []
        self.started = time.monotonic()

    def publish(self, channel, raw):
        event = json.loads(raw)
        event["at"] = round(time.monotonic() - self.started, 3)
        self.events.append(event)

    def redis(self):
        fake = MagicMock()
        fake.publish.side_effect = self.publish
        return fake

    def stages(self):
        return [event["stage"] for event in self.events]

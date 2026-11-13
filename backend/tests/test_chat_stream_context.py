import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.conversation import Conversation
from app.models.job import Job, JobStatus
from app.services.chat_stream.context import build_context


@pytest.mark.asyncio
async def test_general_context_uses_only_completed_owned_job():
    owner = uuid.uuid4()
    conversation = Conversation(id=uuid.uuid4(), user_id=owner, title="New chat")
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        status=JobStatus.COMPLETE,
        file_id="file",
        scores={"overall": 81},
        suggestions=[],
        target_role="Designer",
    )
    messages = MagicMock()
    messages.scalars.return_value.all.return_value = []
    jobs = MagicMock()
    jobs.scalar_one_or_none.return_value = job
    db = AsyncMock()
    db.execute.side_effect = [messages, jobs]
    prompt, history = await build_context(db, conversation, owner, "score")
    assert "overall: 81" in prompt
    assert "Designer" in prompt
    assert history == []


@pytest.mark.asyncio
async def test_general_context_without_completed_job_has_no_personal_data():
    owner = uuid.uuid4()
    conversation = Conversation(id=uuid.uuid4(), user_id=owner, title="New chat")
    messages = MagicMock()
    messages.scalars.return_value.all.return_value = []
    jobs = MagicMock()
    jobs.scalar_one_or_none.return_value = None
    db = AsyncMock()
    db.execute.side_effect = [messages, jobs]
    prompt, _ = await build_context(db, conversation, owner, "score")
    assert "Personal context" not in prompt

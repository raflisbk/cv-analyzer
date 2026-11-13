import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job
from app.services.chat_stream.store import (
    list_conversations,
    list_messages,
    owned_conversation,
    save_user_message,
    title_from_text,
)


def test_title_uses_word_boundary():
    assert title_from_text("A " + "word " * 20) == ("A " + "word " * 11).strip()


@pytest.mark.asyncio
async def test_other_users_conversation_is_not_found():
    db = AsyncMock()
    db.execute.return_value = MagicMock()
    db.execute.return_value.scalar_one_or_none.return_value = None
    with pytest.raises(HTTPException) as error:
        await owned_conversation(db, uuid.uuid4(), uuid.uuid4())
    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_message_limit_rejects_before_write():
    db = AsyncMock()
    db.scalar.return_value = 199
    conversation = Conversation(id=uuid.uuid4(), user_id=uuid.uuid4(), title="New chat")
    conversation.updated_at = datetime.now(UTC)
    with pytest.raises(HTTPException) as error:
        await save_user_message(db, conversation, "Hello")
    assert error.value.status_code == 409
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_list_has_newest_first_and_cv_scope():
    owner = uuid.uuid4()
    newest = Conversation(id=uuid.uuid4(), user_id=owner, title="CV")
    oldest = Conversation(id=uuid.uuid4(), user_id=owner, title="General")
    newest.updated_at = datetime.now(UTC)
    oldest.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    job = Job(
        id=uuid.uuid4(),
        user_id=owner,
        file_id="file",
        file_metadata={"filename": "resume.pdf"},
    )
    rows = MagicMock()
    rows.all.return_value = [(newest, job), (oldest, None)]
    db = AsyncMock()
    db.execute.return_value = rows
    summaries = await list_conversations(db, owner)
    assert [item.id for item in summaries] == [str(newest.id), str(oldest.id)]
    assert summaries[0].scope.model_dump() == {
        "type": "cv",
        "jobId": str(job.id),
        "fileName": "resume.pdf",
    }
    assert summaries[1].scope.model_dump() == {"type": "general"}


@pytest.mark.asyncio
async def test_message_history_is_in_database_order():
    conversation_id = uuid.uuid4()
    first = ConversationMessage(
        id=uuid.uuid4(), conversation_id=conversation_id, role="user", text="Hello"
    )
    second = ConversationMessage(
        id=uuid.uuid4(), conversation_id=conversation_id, role="assistant", text="Hi"
    )
    rows = MagicMock()
    rows.scalars.return_value = [first, second]
    db = AsyncMock()
    db.execute.return_value = rows
    history = await list_messages(db, conversation_id)
    assert [(item.role, item.text) for item in history] == [
        ("user", "Hello"),
        ("assistant", "Hi"),
    ]

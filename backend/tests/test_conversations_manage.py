import uuid
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.conversation import Conversation
from app.schemas.conversations import UpdateConversation
from app.services.chat_stream.manage import (
    build_snippet,
    escape_like,
    restore_conversation,
    search_conversations,
    soft_delete_conversation,
    update_conversation,
)

OWNER = uuid.uuid4()


def conversation(**overrides) -> Conversation:
    values = {
        "id": uuid.uuid4(),
        "user_id": OWNER,
        "title": "Chat",
        "pinned": False,
        "pinned_at": None,
        "deleted_at": None,
        "job_id": None,
    }
    item = Conversation(**{**values, **overrides})
    item.updated_at = datetime(2026, 11, 1, tzinfo=UTC)
    return item


def db_returning(*items):
    db = AsyncMock()
    results = []
    for item in items:
        result = MagicMock()
        result.scalar_one_or_none.return_value = item
        result.one.return_value = (item, None)
        results.append(result)
    db.execute.side_effect = results
    return db


def executed_values(db, index: int) -> dict:
    return db.execute.await_args_list[index].args[0].compile().params


def test_escape_like_keeps_wildcards_literal():
    assert escape_like(r"50%_off\x") == r"50\%\_off\\x"


def test_snippet_is_centred_on_match_and_capped():
    text = "word " * 100 + "needle " + "tail " * 100
    snippet = build_snippet(text, "NEEDLE")
    assert "needle" in snippet
    assert len(snippet) <= 120


def test_snippet_collapses_whitespace():
    assert build_snippet("a\n\nb   c", "b") == "a b c"


@pytest.mark.asyncio
async def test_rename_trims_and_keeps_updated_at():
    item = conversation()
    db = db_returning(item, MagicMock(), item)
    await update_conversation(db, OWNER, item.id, UpdateConversation(title="  New  "))
    params = executed_values(db, 1)
    assert params["title"] == "New"
    assert "pinned" not in params


@pytest.mark.asyncio
async def test_pin_sets_pinned_at():
    item = conversation()
    db = db_returning(item, MagicMock(), item)
    await update_conversation(db, OWNER, item.id, UpdateConversation(pinned=True))
    params = executed_values(db, 1)
    assert params["pinned"] is True
    assert params["pinned_at"] is not None


@pytest.mark.asyncio
async def test_unpin_clears_pinned_at():
    item = conversation(pinned=True, pinned_at=datetime.now(UTC))
    db = db_returning(item, MagicMock(), item)
    await update_conversation(db, OWNER, item.id, UpdateConversation(pinned=False))
    params = executed_values(db, 1)
    assert params["pinned"] is False
    assert params["pinned_at"] is None


@pytest.mark.asyncio
async def test_repinning_keeps_original_pinned_at():
    item = conversation(pinned=True, pinned_at=datetime.now(UTC))
    db = db_returning(item, MagicMock(), item)
    await update_conversation(db, OWNER, item.id, UpdateConversation(pinned=True))
    assert "pinned_at" not in executed_values(db, 1)


@pytest.mark.asyncio
async def test_update_of_missing_conversation_is_404():
    db = db_returning(None)
    with pytest.raises(HTTPException) as error:
        await update_conversation(
            db, OWNER, uuid.uuid4(), UpdateConversation(pinned=True)
        )
    assert error.value.status_code == 404
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_delete_marks_and_returns_restore_deadline():
    item = conversation()
    db = db_returning(item, MagicMock())
    payload = await soft_delete_conversation(db, OWNER, item.id)
    assert payload.restoreUntil - payload.deletedAt == timedelta(hours=24)
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_is_idempotent_within_retention():
    deleted_at = datetime.now(UTC) - timedelta(hours=3)
    item = conversation(deleted_at=deleted_at)
    db = db_returning(item)
    payload = await soft_delete_conversation(db, OWNER, item.id)
    assert payload.deletedAt == deleted_at
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_delete_after_retention_is_404():
    item = conversation(deleted_at=datetime.now(UTC) - timedelta(hours=25))
    with pytest.raises(HTTPException) as error:
        await soft_delete_conversation(db_returning(item), OWNER, item.id)
    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_delete_of_other_users_conversation_is_404():
    with pytest.raises(HTTPException) as error:
        await soft_delete_conversation(db_returning(None), OWNER, uuid.uuid4())
    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_restore_within_window_clears_deleted_at():
    item = conversation(deleted_at=datetime.now(UTC) - timedelta(hours=1))
    db = db_returning(item, MagicMock(), item)
    await restore_conversation(db, OWNER, item.id)
    assert executed_values(db, 1)["deleted_at"] is None
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_restore_of_active_conversation_is_404():
    item = conversation()
    with pytest.raises(HTTPException) as error:
        await restore_conversation(db_returning(item), OWNER, item.id)
    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_restore_after_retention_is_410():
    item = conversation(deleted_at=datetime.now(UTC) - timedelta(hours=24, minutes=1))
    db = db_returning(item)
    with pytest.raises(HTTPException) as error:
        await restore_conversation(db, OWNER, item.id)
    assert error.value.status_code == 410
    db.commit.assert_not_awaited()


def search_db(rows, matches):
    first = MagicMock()
    first.all.return_value = rows
    second = MagicMock()
    second.all.return_value = matches
    db = AsyncMock()
    db.execute.side_effect = [first, second]
    return db


@pytest.mark.asyncio
async def test_search_title_match_has_null_snippet_and_skips_message_lookup():
    item = conversation(title="Resume tips")
    db = search_db([(item, None)], [])
    results = await search_conversations(db, OWNER, "resume")
    assert results[0].snippet is None
    assert db.execute.await_count == 1


@pytest.mark.asyncio
async def test_search_message_match_returns_snippet():
    item = conversation(title="Chat")
    db = search_db([(item, None)], [(item.id, "please fix my Python skills")])
    results = await search_conversations(db, OWNER, "python")
    assert "Python" in results[0].snippet


@pytest.mark.asyncio
async def test_search_query_uses_escaped_pattern_and_limit():
    db = search_db([], [])
    await search_conversations(db, OWNER, "50%_x")
    compiled = db.execute.await_args_list[0].args[0].compile()
    assert r"%50\%\_x%" in compiled.params.values()
    assert 50 in compiled.params.values()

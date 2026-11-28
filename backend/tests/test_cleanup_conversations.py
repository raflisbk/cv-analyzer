from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.tasks.cleanup_conversations import purge_expired_conversations

NOW = datetime(2026, 11, 28, 12, tzinfo=UTC)


@pytest.mark.asyncio
async def test_purge_deletes_only_rows_past_retention_and_reports_count():
    db = AsyncMock()
    db.execute.return_value = MagicMock(rowcount=3)
    assert await purge_expired_conversations(db, NOW) == 3
    compiled = db.execute.await_args.args[0].compile()
    assert NOW - timedelta(hours=24) in compiled.params.values()
    assert "deleted_at IS NOT NULL" in str(compiled)
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_purge_with_nothing_expired_returns_zero():
    db = AsyncMock()
    db.execute.return_value = MagicMock(rowcount=None)
    assert await purge_expired_conversations(db, NOW) == 0


def test_purge_is_scheduled_hourly():
    from app.tasks.celery_app import celery_app

    entry = celery_app.conf.beat_schedule["purge-deleted-conversations"]
    assert entry["task"].endswith("purge_deleted_conversations")

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app
from app.schemas.conversations import (
    ConversationSummary,
    DeletedConversation,
    GeneralScope,
)

MODULE = "app.api.v1.endpoints.conversations"
NOW = datetime(2026, 11, 28, tzinfo=UTC)


@pytest.fixture
def client():
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()

    async def db_override():
        yield AsyncMock()

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: SimpleNamespace(id=owner)
    yield TestClient(app)
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def summary_item(**extra) -> ConversationSummary:
    return ConversationSummary(
        id=str(uuid.uuid4()),
        title="Chat",
        scope=GeneralScope(),
        updatedAt=NOW,
        **extra,
    )


def url(suffix: str = "") -> str:
    return f"/api/v1/conversations/{uuid.uuid4()}{suffix}"


@pytest.mark.parametrize(
    ("method", "suffix"),
    [("patch", ""), ("delete", ""), ("post", "/restore")],
)
def test_manage_routes_require_login(client, method, suffix):
    app.dependency_overrides.pop(require_user)
    response = client.request(method, url(suffix), json={"pinned": True})
    assert response.status_code == 401


def test_patch_returns_updated_summary(client):
    updated = summary_item(pinned=True, pinnedAt=NOW)
    with patch(f"{MODULE}.update_conversation", new=AsyncMock(return_value=updated)):
        response = client.patch(url(), json={"pinned": True})
    body = response.json()["data"]
    assert response.status_code == 200
    assert body["pinned"] is True
    assert "snippet" not in body


@pytest.mark.parametrize(
    "payload",
    [{}, {"title": ""}, {"title": "   "}, {"title": "x" * 121}, {"title": None}],
)
def test_patch_rejects_invalid_body(client, payload):
    assert client.patch(url(), json=payload).status_code == 422


def test_patch_missing_conversation_is_404(client):
    missing = AsyncMock(side_effect=HTTPException(status_code=404, detail="gone"))
    with patch(f"{MODULE}.update_conversation", new=missing):
        assert client.patch(url(), json={"title": "A"}).status_code == 404


def test_delete_returns_restore_deadline(client):
    payload = DeletedConversation(id="abc", deletedAt=NOW, restoreUntil=NOW)
    with patch(
        f"{MODULE}.soft_delete_conversation", new=AsyncMock(return_value=payload)
    ):
        response = client.delete(url())
    assert response.status_code == 200
    assert set(response.json()["data"]) == {"id", "deletedAt", "restoreUntil"}


def test_restore_after_window_is_410(client):
    expired = AsyncMock(side_effect=HTTPException(status_code=410, detail="late"))
    with patch(f"{MODULE}.restore_conversation", new=expired):
        assert client.post(url("/restore")).status_code == 410


def test_restore_returns_summary(client):
    with patch(
        f"{MODULE}.restore_conversation",
        new=AsyncMock(return_value=summary_item(pinned=False)),
    ):
        response = client.post(url("/restore"))
    assert response.json()["data"]["pinned"] is False


def test_list_without_query_keeps_default_shape(client):
    with patch(
        f"{MODULE}.list_conversations", new=AsyncMock(return_value=[summary_item()])
    ):
        response = client.get("/api/v1/conversations")
    assert "snippet" not in response.json()["data"][0]


def test_list_with_query_includes_snippet_even_when_null(client):
    results = [summary_item(snippet="hit"), summary_item(snippet=None)]
    results[1].snippet = None
    with patch(f"{MODULE}.search_conversations", new=AsyncMock(return_value=results)):
        response = client.get("/api/v1/conversations", params={"q": "hit"})
    assert [item["snippet"] for item in response.json()["data"]] == ["hit", None]


def test_list_rejects_overlong_query(client):
    assert (
        client.get("/api/v1/conversations", params={"q": "x" * 81}).status_code == 422
    )


def test_blank_query_falls_back_to_plain_list(client):
    plain = AsyncMock(return_value=[])
    with patch(f"{MODULE}.list_conversations", new=plain):
        client.get("/api/v1/conversations", params={"q": "   "})
    plain.assert_awaited_once()

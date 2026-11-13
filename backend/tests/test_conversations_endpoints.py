import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app


@pytest.fixture
def api():
    original = dict(app.dependency_overrides)
    owner = uuid.uuid4()
    db = AsyncMock()

    async def db_override():
        yield db

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: SimpleNamespace(id=owner)
    yield TestClient(app), owner, db
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


@pytest.mark.parametrize(
    ("method", "path", "body"),
    [
        ("get", "/api/v1/conversations", None),
        ("post", "/api/v1/conversations", {}),
        ("get", f"/api/v1/conversations/{uuid.uuid4()}/messages", None),
        ("post", f"/api/v1/conversations/{uuid.uuid4()}/messages", {"text": "Hello"}),
    ],
)
def test_routes_require_login(api, method, path, body):
    client, _, _ = api
    app.dependency_overrides.pop(require_user)
    response = client.get(path) if method == "get" else client.post(path, json=body)
    assert response.status_code == 401


@pytest.mark.parametrize("method", ["get", "post"])
def test_other_users_messages_return_404(api, method):
    client, _, db = api
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    db.execute.return_value = result
    path = f"/api/v1/conversations/{uuid.uuid4()}/messages"
    response = (
        client.get(path)
        if method == "get"
        else client.post(path, json={"text": "Hello"})
    )
    assert response.status_code == 404


def test_create_with_other_users_job_returns_404(api):
    client, _, db = api
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    db.execute.return_value = result
    response = client.post("/api/v1/conversations", json={"jobId": str(uuid.uuid4())})
    assert response.status_code == 404


def test_message_input_limit_is_validated(api):
    client, _, db = api
    path = f"/api/v1/conversations/{uuid.uuid4()}/messages"
    assert client.post(path, json={"text": "x" * 2001}).status_code == 422
    db.execute.assert_not_awaited()


def test_stream_emits_tokens_and_complete(api):
    client, _, _ = api
    conversation_id = uuid.uuid4()
    conversation = SimpleNamespace(id=conversation_id)

    def chunks():
        yield "Hi"
        yield " there"

    with (
        patch(
            "app.api.v1.endpoints.conversations.owned_conversation",
            new=AsyncMock(return_value=conversation),
        ),
        patch("app.api.v1.endpoints.conversations.save_user_message", new=AsyncMock()),
        patch(
            "app.api.v1.endpoints.conversations.build_context",
            new=AsyncMock(return_value=("system", [])),
        ),
        patch(
            "app.api.v1.endpoints.conversations.save_assistant_message", new=AsyncMock()
        ) as save,
        patch("app.api.v1.endpoints.conversations.KoboiLLMService") as service,
        patch("app.api.v1.endpoints.conversations.async_session_maker") as maker,
    ):
        service.return_value.chat_stream.side_effect = lambda *_: chunks()
        maker.return_value.__aenter__.return_value = AsyncMock()
        response = client.post(
            f"/api/v1/conversations/{conversation_id}/messages", json={"text": "Hello"}
        )
    assert response.status_code == 200
    assert 'data: {"token": "Hi"}' in response.text
    assert 'data: {"token": " there"}' in response.text
    assert (
        'data: {"type": "complete", "text": "Hi there", "actions": []}' in response.text
    )
    save.assert_awaited_once()


def test_stream_failure_emits_error_without_assistant_write(api):
    client, _, _ = api
    conversation_id = uuid.uuid4()

    def chunks():
        yield "partial"
        raise RuntimeError("provider failure")

    with (
        patch(
            "app.api.v1.endpoints.conversations.owned_conversation",
            new=AsyncMock(return_value=SimpleNamespace(id=conversation_id)),
        ),
        patch("app.api.v1.endpoints.conversations.save_user_message", new=AsyncMock()),
        patch(
            "app.api.v1.endpoints.conversations.build_context",
            new=AsyncMock(return_value=("system", [])),
        ),
        patch(
            "app.api.v1.endpoints.conversations.save_assistant_message", new=AsyncMock()
        ) as save,
        patch("app.api.v1.endpoints.conversations.KoboiLLMService") as service,
        patch("app.api.v1.endpoints.conversations.async_session_maker") as maker,
    ):
        service.return_value.chat_stream.side_effect = lambda *_: chunks()
        maker.return_value.__aenter__.return_value = AsyncMock()
        response = client.post(
            f"/api/v1/conversations/{conversation_id}/messages", json={"text": "Hello"}
        )
    assert 'data: {"token": "partial"}' in response.text
    assert 'data: {"error": "Could not complete your message."}' in response.text
    save.assert_not_awaited()

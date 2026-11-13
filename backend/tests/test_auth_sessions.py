from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import Response
from starlette.requests import Request

from app.models.user_session import UserSession
from app.services.auth.cookies import clear_auth_cookies, set_auth_cookies
from app.services.auth.identity import authenticated_user
from app.services.auth.revocation import list_sessions, logout_all, revoke_owned_session
from app.services.auth.rotation import rotate_session
from app.services.auth.session_store import active, create_session

NOW = datetime(2026, 11, 14, tzinfo=UTC)


def request(cookies: dict[str, str] | None = None) -> Request:
    header = b"; ".join(f"{k}={v}".encode() for k, v in (cookies or {}).items())
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/auth/refresh",
            "scheme": "https",
            "server": ("example.com", 443),
            "headers": [(b"cookie", header)],
            "client": ("127.0.0.1", 1),
        }
    )


def session(**changes) -> UserSession:
    values = {
        "id": uuid4(),
        "user_id": uuid4(),
        "family_id": uuid4(),
        "revoked_at": None,
        "replaced_by_id": None,
        "idle_expires_at": NOW + timedelta(days=1),
        "absolute_expires_at": NOW + timedelta(days=10),
        "created_at": NOW,
        "last_used_at": NOW,
        "user_agent": "browser",
        "ip": "127.0.0.1",
    }
    values.update(changes)
    return UserSession(**values)


@pytest.mark.asyncio
async def test_login_session_stores_only_hash_and_truncates_metadata():
    db = MagicMock()
    db.flush = AsyncMock()
    created, token = await create_session(db, uuid4(), "a" * 300, "1" * 60, NOW)
    assert created.refresh_hash != token
    assert len(created.refresh_hash) == 64
    assert len(created.user_agent) == 255
    assert len(created.ip) == 45


def test_cookie_flags_and_lifetimes():
    response = Response()
    set_auth_cookies(response, request(), "access", "refresh")
    cookies = response.headers.getlist("set-cookie")
    assert "access_token=access" in cookies[0]
    assert "Max-Age=900" in cookies[0]
    assert "Path=/" in cookies[0]
    assert "HttpOnly" in cookies[0]
    assert "SameSite=strict" in cookies[0]
    assert "refresh_token=refresh" in cookies[1]
    assert "Max-Age=2592000" in cookies[1]
    assert "Path=/api/v1/auth" in cookies[1]
    assert "HttpOnly" in cookies[1]
    assert "SameSite=strict" in cookies[1]
    assert "session_hint=1" in cookies[2]
    assert "Max-Age=2592000" in cookies[2]
    assert "Path=/" in cookies[2]
    assert "SameSite=strict" in cookies[2]
    assert "HttpOnly" not in cookies[2]
    assert "access" not in cookies[2]
    assert "refresh" not in cookies[2]


@pytest.mark.asyncio
async def test_refresh_rotates_session():
    old = session()
    user = SimpleNamespace(id=old.user_id, is_active=True)
    replacement = session(user_id=old.user_id, family_id=old.family_id)
    db = MagicMock()
    db.get = AsyncMock(return_value=user)
    db.commit = AsyncMock()
    with (
        patch(
            "app.services.auth.rotation.session_by_refresh", AsyncMock(return_value=old)
        ),
        patch(
            "app.services.auth.rotation.create_session",
            AsyncMock(return_value=(replacement, "new")),
        ),
    ):
        result = await rotate_session(db, "old", "agent", "ip", NOW)
    assert result == (user, replacement, "new")
    assert old.replaced_by_id == replacement.id
    assert old.revoked_at == NOW


@pytest.mark.asyncio
async def test_reused_refresh_revokes_family():
    old = session(replaced_by_id=uuid4(), revoked_at=NOW)
    db = MagicMock()
    db.commit = AsyncMock()
    with (
        patch(
            "app.services.auth.rotation.session_by_refresh", AsyncMock(return_value=old)
        ),
        patch("app.services.auth.rotation.revoke_family", AsyncMock()) as revoke,
    ):
        assert await rotate_session(db, "old", None, None, NOW) is None
    revoke.assert_awaited_once_with(db, old.family_id, NOW)


@pytest.mark.parametrize(
    "changes",
    [
        {"idle_expires_at": NOW},
        {"absolute_expires_at": NOW},
        {"revoked_at": NOW},
    ],
)
def test_expired_or_revoked_session_is_inactive(changes):
    assert not active(session(**changes), NOW)


@pytest.mark.asyncio
async def test_old_access_token_without_sid_is_rejected():
    db = MagicMock()
    with patch(
        "app.services.auth.identity.verify_token",
        return_value={"typ": "access", "sub": str(uuid4())},
    ):
        assert await authenticated_user(db, request({"access_token": "legacy"})) is None
    db.get.assert_not_called()


@pytest.mark.asyncio
async def test_expired_access_token_is_rejected():
    db = MagicMock()
    with patch("app.services.auth.identity.verify_token", return_value=None):
        assert (
            await authenticated_user(db, request({"access_token": "expired"})) is None
        )
    db.get.assert_not_called()


@pytest.mark.asyncio
async def test_logout_all_scopes_update_to_user():
    db = MagicMock()
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    user_id = uuid4()
    await logout_all(db, user_id, NOW)
    compiled = str(db.execute.await_args.args[0])
    assert "user_sessions.user_id" in compiled
    assert "user_sessions.revoked_at" in compiled


@pytest.mark.asyncio
async def test_session_list_is_scoped_to_owner():
    db = MagicMock()
    db.execute = AsyncMock(return_value=MagicMock(scalars=MagicMock(return_value=[])))
    user_id = uuid4()
    assert await list_sessions(db, user_id, NOW) == []
    assert "user_sessions.user_id" in str(db.execute.await_args.args[0])


@pytest.mark.asyncio
async def test_other_users_session_cannot_be_deleted():
    db = MagicMock()
    db.get = AsyncMock(return_value=session())
    db.commit = AsyncMock()
    assert not await revoke_owned_session(db, uuid4(), uuid4(), NOW)
    db.commit.assert_not_awaited()


def test_clear_cookies_uses_both_paths():
    response = Response()
    clear_auth_cookies(response, request())
    cookies = response.headers.getlist("set-cookie")
    assert any("access_token=" in cookie and "Path=/" in cookie for cookie in cookies)
    assert any(
        "refresh_token=" in cookie and "Path=/api/v1/auth" in cookie
        for cookie in cookies
    )
    assert any("session_hint=" in cookie and "Path=/" in cookie for cookie in cookies)


@pytest.mark.asyncio
async def test_google_login_creates_session_and_both_cookies():
    from app.api.v1.endpoints.auth import login_with_google
    from app.schemas.auth import GoogleLoginRequest

    user = SimpleNamespace(
        id=uuid4(), email="person@example.com", name="Person", picture=None
    )
    created = session(user_id=user.id)
    db = MagicMock()
    response = Response()
    with (
        patch(
            "app.api.v1.endpoints.auth.verify_google_token",
            AsyncMock(return_value={"google_id": "g"}),
        ),
        patch(
            "app.api.v1.endpoints.auth.login",
            AsyncMock(return_value=(user, created, "refresh")),
        ),
    ):
        result = await login_with_google(
            GoogleLoginRequest(access_token="google"), request(), response, db
        )
    assert result.email == user.email
    cookies = response.headers.getlist("set-cookie")
    assert any("access_token=" in cookie for cookie in cookies)
    assert any("refresh_token=refresh" in cookie for cookie in cookies)
    assert any("session_hint=1" in cookie for cookie in cookies)


@pytest.mark.asyncio
async def test_invalid_refresh_returns_401_and_clears_cookies():
    from app.api.v1.endpoints.auth import refresh

    db = MagicMock()
    with patch(
        "app.api.v1.endpoints.auth.rotate_session", AsyncMock(return_value=None)
    ):
        result = await refresh(request({"refresh_token": "old"}), Response(), db)
    assert result.status_code == 401
    assert len(result.headers.getlist("set-cookie")) == 3


@pytest.mark.asyncio
async def test_logout_revokes_session_and_clears_cookies():
    from app.api.v1.endpoints.auth import logout

    db = MagicMock()
    response = Response()
    with patch("app.api.v1.endpoints.auth.logout_session", AsyncMock()) as revoke:
        result = await logout(request(), response, db)
    assert result["message"] == "Logged out successfully."
    revoke.assert_awaited_once()
    assert len(response.headers.getlist("set-cookie")) == 3


@pytest.mark.asyncio
async def test_logout_all_clears_session_hint():
    from app.api.v1.endpoints.auth import logout_everywhere

    db = MagicMock()
    response = Response()
    user = SimpleNamespace(id=uuid4())
    with patch("app.api.v1.endpoints.auth.logout_all", AsyncMock()):
        await logout_everywhere(request(), response, user, db)
    assert any(
        "session_hint=" in cookie and "Max-Age=0" in cookie
        for cookie in response.headers.getlist("set-cookie")
    )


@pytest.mark.asyncio
async def test_successful_refresh_sets_session_hint():
    from app.api.v1.endpoints.auth import refresh

    created = session()
    user = SimpleNamespace(
        id=created.user_id, email="person@example.com", name="Person", picture=None
    )
    response = Response()
    with patch(
        "app.api.v1.endpoints.auth.rotate_session",
        AsyncMock(return_value=(user, created, "new-refresh")),
    ):
        await refresh(request({"refresh_token": "old"}), response, MagicMock())
    assert any(
        "session_hint=1" in cookie for cookie in response.headers.getlist("set-cookie")
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "changes",
    [
        {"idle_expires_at": NOW},
        {"absolute_expires_at": NOW},
        {"revoked_at": NOW},
    ],
)
async def test_refresh_rejects_expired_or_revoked_session(changes):
    old = session(**changes)
    db = MagicMock()
    with patch(
        "app.services.auth.rotation.session_by_refresh", AsyncMock(return_value=old)
    ):
        assert await rotate_session(db, "refresh", None, None, NOW) is None
    db.get.assert_not_called()


@pytest.mark.asyncio
async def test_revoked_session_blocks_access_cookie():
    old = session(revoked_at=NOW)
    db = MagicMock()
    db.get = AsyncMock(return_value=old)
    claims = {"typ": "access", "sub": str(old.user_id), "sid": str(old.id)}
    with (
        patch("app.services.auth.identity.verify_token", return_value=claims),
        patch("app.services.auth.identity.current_time", return_value=NOW),
    ):
        assert await authenticated_user(db, request({"access_token": "access"})) is None
    db.get.assert_awaited_once_with(UserSession, old.id)


def test_secure_cookie_on_public_host():
    from app.services.auth.cookies import cookie_secure

    public_request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "scheme": "https",
            "server": ("example.com", 443),
            "headers": [],
        }
    )
    with patch(
        "app.services.auth.cookies.get_settings",
        return_value=SimpleNamespace(
            CV_ANALYZER_COOKIE_SECURE=True,
            CV_ANALYZER_ENV="production",
            CV_ANALYZER_ACCESS_TOKEN_MINUTES=15,
            CV_ANALYZER_REFRESH_ABSOLUTE_DAYS=30,
        ),
    ):
        assert cookie_secure(public_request)
        response = Response()
        set_auth_cookies(response, public_request, "access", "refresh")
    assert "Secure" in response.headers.getlist("set-cookie")[2]


def test_expired_access_jwt_is_rejected():
    from app.core.auth import verify_token
    from app.services.auth.tokens import issue_access_token

    token = issue_access_token(
        uuid4(), "person@example.com", uuid4(), datetime(2020, 1, 1, tzinfo=UTC)
    )
    assert verify_token(token) is None


def test_rotated_refresh_cookie_uses_remaining_absolute_lifetime():
    response = Response()
    expiry = datetime.now(UTC) + timedelta(days=2)
    set_auth_cookies(response, request(), "access", "refresh", expiry)
    refresh_cookie = response.headers.getlist("set-cookie")[1]
    assert "Max-Age=172800" in refresh_cookie or "Max-Age=172799" in refresh_cookie
    hint_cookie = response.headers.getlist("set-cookie")[2]
    assert "Max-Age=172800" in hint_cookie or "Max-Age=172799" in hint_cookie


@pytest.mark.asyncio
async def test_cleanup_removes_only_sessions_expired_over_seven_days():
    from app.services.auth.session_store import cleanup_old_sessions

    db = MagicMock()
    db.execute = AsyncMock(return_value=SimpleNamespace(rowcount=2))
    db.commit = AsyncMock()
    assert await cleanup_old_sessions(db, NOW) == 2
    statement = db.execute.await_args.args[0]
    assert NOW - timedelta(days=7) in statement.compile().params.values()

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_user
from app.core.auth import verify_google_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, SessionResponse, UserResponse
from app.services.auth.cookies import clear_auth_cookies, set_auth_cookies
from app.services.auth.identity import access_claims, authenticated_user
from app.services.auth.login import login
from app.services.auth.revocation import (
    list_sessions, logout_all, logout_session, revoke_owned_session,
)
from app.services.auth.rotation import rotate_session
from app.services.auth.session_store import current_time
from app.services.auth.tokens import issue_access_token

router = APIRouter()


def user_response(user: User) -> UserResponse:
    return UserResponse(id=str(user.id), email=user.email, name=user.name, picture=user.picture)


def client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.post("/google", response_model=UserResponse)
async def login_with_google(
    body: GoogleLoginRequest, request: Request, response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    google_user = await verify_google_token(body.access_token)
    try:
        user, session, refresh = await login(
            db, google_user, request.headers.get("user-agent"), client_ip(request)
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Inactive user.") from exc
    access = issue_access_token(user.id, user.email, session.id, current_time())
    set_auth_cookies(response, request, access, refresh)
    return user_response(user)


@router.post("/refresh", response_model=UserResponse)
async def refresh(
    request: Request, response: Response, db: AsyncSession = Depends(get_db),
) -> UserResponse:
    token = request.cookies.get("refresh_token")
    rotated = await rotate_session(
        db, token, request.headers.get("user-agent"), client_ip(request)
    ) if token else None
    if rotated is None:
        clear_auth_cookies(response, request)
        raise HTTPException(status_code=401, detail="Invalid refresh session.")
    user, session, refresh_token = rotated
    access = issue_access_token(user.id, user.email, session.id, current_time())
    set_auth_cookies(response, request, access, refresh_token)
    return user_response(user)


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(require_user)) -> UserResponse:
    return user_response(user)


@router.post("/logout")
async def logout(
    request: Request, response: Response, db: AsyncSession = Depends(get_db),
) -> dict:
    await logout_session(db, request)
    clear_auth_cookies(response, request)
    return {"message": "Logged out successfully."}


@router.post("/logout-all")
async def logout_everywhere(
    request: Request, response: Response, user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await logout_all(db, user.id)
    clear_auth_cookies(response, request)
    return {"message": "Logged out successfully."}


@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    request: Request, user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> list[SessionResponse]:
    sessions = await list_sessions(db, user.id)
    claims = access_claims(request)
    current_id = claims[1] if claims else None
    return [
        SessionResponse(
            id=session.id, createdAt=session.created_at, lastUsedAt=session.last_used_at,
            userAgent=session.user_agent, ip=session.ip, current=session.id == current_id,
        ) for session in sessions
    ]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: UUID, user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not await revoke_owned_session(db, user.id, session_id):
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"message": "Session revoked."}

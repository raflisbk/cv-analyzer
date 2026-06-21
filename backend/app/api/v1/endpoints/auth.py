from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import (
    clear_auth_cookie,
    create_access_token,
    set_auth_cookie,
    verify_google_token,
    verify_token,
)
from app.core.logging import structured_logger as logger
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


class GoogleLoginRequest(BaseModel):
    access_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    picture: str | None


@router.post("/google", response_model=UserResponse)
async def login_with_google(
    body: GoogleLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    google_user = await verify_google_token(body.access_token)

    stmt = select(User).where(User.google_id == google_user["google_id"])
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            google_id=google_user["google_id"],
            email=google_user["email"],
            name=google_user["name"],
            picture=google_user["picture"],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("user_created", email=user.email)
    else:
        user.name = google_user["name"]
        user.picture = google_user["picture"]
        await db.commit()
        logger.info("user_logged_in", email=user.email)

    token = create_access_token(str(user.id), user.email)
    set_auth_cookie(response, token)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found.")

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.post("/logout")
async def logout(response: Response) -> dict:
    clear_auth_cookie(response)
    return {"message": "Logged out successfully."}

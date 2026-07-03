from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, Response
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


def create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(days=settings.CV_ANALYZER_JWT_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.CV_ANALYZER_JWT_SECRET,
        algorithm=settings.CV_ANALYZER_JWT_ALGORITHM,
    )


def verify_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.CV_ANALYZER_JWT_SECRET,
            algorithms=[settings.CV_ANALYZER_JWT_ALGORITHM],
        )
    except JWTError:
        return None


async def verify_google_token(access_token: str) -> dict:
    """Verify Google OAuth access token via userinfo endpoint and return user info dict."""
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0,
            )

        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token.")

        id_info = resp.json()
        logger.info("google_token_verified", email=id_info.get("email"))

        return {
            "google_id": id_info["sub"],
            "email": id_info["email"],
            "name": id_info.get("name"),
            "picture": id_info.get("picture"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("google_token_verification_failed", error=str(e))
        raise HTTPException(
            status_code=401, detail="Google token verification failed."
        ) from e


def set_auth_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    max_age = settings.CV_ANALYZER_JWT_EXPIRE_DAYS * 24 * 60 * 60
    is_prod = settings.CV_ANALYZER_ENV == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=max_age,
        httponly=True,
        secure=is_prod,
        samesite="strict",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key="access_token", httponly=True, samesite="strict")

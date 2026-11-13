from fastapi import HTTPException
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


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

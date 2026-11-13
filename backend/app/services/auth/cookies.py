from fastapi import Request, Response

from app.core.config import get_settings


def cookie_secure(request: Request) -> bool:
    settings = get_settings()
    return (
        settings.CV_ANALYZER_COOKIE_SECURE
        and settings.CV_ANALYZER_ENV != "development"
        and request.url.hostname not in {"localhost", "127.0.0.1", "::1"}
    )


def set_auth_cookies(response: Response, request: Request, access: str, refresh: str) -> None:
    settings = get_settings()
    options = {"httponly": True, "secure": cookie_secure(request), "samesite": "strict"}
    response.set_cookie(
        "access_token", access, path="/",
        max_age=settings.CV_ANALYZER_ACCESS_TOKEN_MINUTES * 60, **options,
    )
    response.set_cookie(
        "refresh_token", refresh, path="/api/v1/auth",
        max_age=settings.CV_ANALYZER_REFRESH_ABSOLUTE_DAYS * 86400, **options,
    )


def clear_auth_cookies(response: Response, request: Request) -> None:
    options = {"httponly": True, "secure": cookie_secure(request), "samesite": "strict"}
    response.delete_cookie("access_token", path="/", **options)
    response.delete_cookie("refresh_token", path="/api/v1/auth", **options)

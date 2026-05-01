from datetime import UTC, datetime

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.endpoints.yjs import yjs_asgi_app
from app.api.v1.router import router as api_v1_router

# Import settings and logging before anything else
from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.logging import structured_logger as logger


settings = get_settings()

# Initialize Sentry if DSN is configured
if settings.CV_ANALYZER_SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.CV_ANALYZER_SENTRY_DSN,
        integrations=[FastApiIntegration()],
        environment=settings.CV_ANALYZER_ENV,
        traces_sample_rate=1.0 if settings.CV_ANALYZER_ENV == "development" else 0.1,
    )
    logger.info("sentry_initialized", environment=settings.CV_ANALYZER_ENV)

# Create FastAPI application
app = FastAPI(
    title="CV Analyzer API",
    version="0.1.0",
    description="AI-powered CV analysis and improvement suggestions",
)

# Attach rate limiter state and exception handler per slowapi docs
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
origins = (
    settings.CV_ANALYZER_CORS_ORIGINS.split(",")
    if settings.CV_ANALYZER_CORS_ORIGINS
    else []
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("cors_configured", origins=origins)

# Add Prometheus instrumentation
Instrumentator().instrument(app).expose(app)
logger.info("prometheus_configured")


@app.on_event("startup")
async def startup_event() -> None:
    """Application startup event handler"""
    logger.info(
        "app_starting",
        app_name=settings.CV_ANALYZER_APP_NAME,
        version=settings.CV_ANALYZER_VERSION,
        environment=settings.CV_ANALYZER_ENV,
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "version": "0.1.0",
    }


# Mount API v1 router
app.include_router(api_v1_router, prefix="/api")

# Mount Yjs CRDT WebSocket sub-app
app.mount("/yjs", yjs_asgi_app)

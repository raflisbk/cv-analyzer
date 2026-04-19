import asyncio
import concurrent.futures
from datetime import UTC, datetime

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.endpoints.yjs import yjs_asgi_app, yjs_server
from app.api.v1.router import router as api_v1_router

# Import settings and logging before anything else
from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.logging import structured_logger as logger
from app.services.grammar.checker import get_tool as get_grammar_tool


settings = get_settings()

# Initialize Sentry if DSN is configured
if settings.CV_ANALYZER_SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.CV_ANALYZER_SENTRY_DSN,
        integrations=[FastApiIntegration()],
        environment=settings.CV_ANALYZER_ENV,
        traces_sample_rate=1.0 if settings.CV_ANALYZER_ENV == "development" else 0.1,
    )
    logger.info(
        "Sentry SDK initialized", extra={"environment": settings.CV_ANALYZER_ENV}
    )

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
logger.info("CORS middleware configured", extra={"origins": origins})

# Add Prometheus instrumentation
Instrumentator().instrument(app).expose(app)
logger.info("Prometheus instrumentation configured")


@app.on_event("startup")
async def startup_event():
    """Application startup event handler"""
    logger.info(
        "FastAPI application starting",
        extra={
            "app_name": settings.CV_ANALYZER_APP_NAME,
            "version": settings.CV_ANALYZER_VERSION,
            "environment": settings.CV_ANALYZER_ENV,
        },
    )

    # Start Yjs CRDT WebSocket server
    await yjs_server.start()
    logger.info("pycrdt-websocket WebsocketServer started")


@app.on_event("startup")
async def _prewarm_language_tool() -> None:
    """
    Pre-warm LanguageTool on startup to avoid 30s cold start on first grammar check.
    Runs in background thread to not block FastAPI startup.
    Failure is non-fatal — grammar checks will return empty list if Java unavailable.
    Per Pitfall 2 in 02-RESEARCH.md.
    """
    loop = asyncio.get_event_loop()
    try:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            await loop.run_in_executor(pool, get_grammar_tool)
        logger.info("LanguageTool pre-warm complete")
    except Exception as exc:
        logger.warning(
            "LanguageTool pre-warm failed — grammar checks will be skipped",
            extra={"error": str(exc)},
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "version": "0.1.0",
    }


# Mount API v1 router per D-52
app.include_router(api_v1_router, prefix="/api")

# Mount Yjs CRDT WebSocket sub-app
app.mount("/yjs", yjs_asgi_app)

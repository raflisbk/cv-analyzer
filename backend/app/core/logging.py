import re
import sys

from loguru import logger

from app.core.config import get_settings


# Compiled once at module level for performance
_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
_PHONE_RE = re.compile(r"\b(\+?[\d][\d\s\-\(\)\.]{6,14}[\d])\b")
# Name patterns: "John Smith" style (2 capitalized words) — conservative regex
_NAME_RE = re.compile(r"\b([A-Z][a-z]{1,20}\s){1,2}[A-Z][a-z]{1,20}\b")


def mask_pii(text: str) -> str:
    """Mask PII from error strings before logging.

    Strips email addresses, phone numbers, and proper name patterns.
    Applied to all logger.error() calls in comparison task and export endpoint.

    Example:
        mask_pii("Error: john@example.com failed") -> "Error: [EMAIL] failed"
    """
    text = _EMAIL_RE.sub("[EMAIL]", text)
    text = _PHONE_RE.sub("[PHONE]", text)
    return _NAME_RE.sub("[NAME]", text)


def setup_logging():
    """Configure structured JSON logging with loguru"""
    settings = get_settings()

    # Remove default handler
    logger.remove()

    # Add JSON structured format handler
    logger.add(
        sys.stdout,
        format="{message}",
        level=settings.CV_ANALYZER_LOG_LEVEL,
        serialize=True,  # JSON output
        backtrace=True,
        diagnose=True,
    )

    return logger


# Export configured logger
structured_logger = setup_logging()

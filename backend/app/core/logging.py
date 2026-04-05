import sys

from loguru import logger

from app.core.config import get_settings


def setup_logging():
    """Configure structured JSON logging with loguru"""
    settings = get_settings()

    # Remove default handler
    logger.remove()

    # Add JSON structured format handler (per D-41)
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

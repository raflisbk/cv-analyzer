import logging
import re
import sys

from loguru import logger

from app.core.config import get_settings


_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
_PHONE_RE = re.compile(r"\b(\+?[\d][\d\s\-\(\)\.]{6,14}[\d])\b")
_NAME_RE = re.compile(r"\b([A-Z][a-z]{1,20}\s){1,2}[A-Z][a-z]{1,20}\b")

_DEV_FORMAT = (
    "<green>{time:HH:mm:ss}</green> │ "
    "<level>{level:<7}</level> │ "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> │ "
    "<level>{message}</level>"
)


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def mask_pii(text: str) -> str:
    text = _EMAIL_RE.sub("[EMAIL]", text)
    text = _PHONE_RE.sub("[PHONE]", text)
    return _NAME_RE.sub("[NAME]", text)


def setup_logging():
    settings = get_settings()
    is_dev = settings.CV_ANALYZER_ENV == "development"

    logger.remove()

    if is_dev:
        logger.add(
            sys.stderr,
            format=_DEV_FORMAT,
            level=settings.CV_ANALYZER_LOG_LEVEL,
            colorize=True,
            backtrace=True,
            diagnose=True,
        )
    else:
        logger.add(
            sys.stdout,
            format="{message}",
            level=settings.CV_ANALYZER_LOG_LEVEL,
            serialize=True,
            backtrace=True,
            diagnose=False,
        )

    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logging.getLogger(name).handlers = [InterceptHandler()]
        logging.getLogger(name).propagate = False

    return logger


structured_logger = setup_logging()

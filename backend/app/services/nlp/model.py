"""
spaCy model singleton loader per D-05.
Loads en_core_web_lg exactly once at first call — never per request.
"""

import spacy

from app.core.logging import structured_logger as logger


_nlp: spacy.Language | None = None


def get_nlp() -> spacy.Language:
    """
    Lazy-load spaCy en_core_web_lg as module-level singleton per D-05.
    Thread-safe for Celery workers (each worker process loads once).
    """
    global _nlp  # noqa: PLW0603
    if _nlp is None:
        logger.info("Loading spaCy en_core_web_lg model (first call only)...")
        _nlp = spacy.load("en_core_web_lg")
        logger.info(
            "spaCy model loaded",
            extra={"pipeline": _nlp.pipe_names, "model": _nlp.meta["name"]},
        )
    return _nlp

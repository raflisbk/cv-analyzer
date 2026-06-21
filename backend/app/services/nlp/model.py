import spacy

from app.core.logging import structured_logger as logger

_nlp: spacy.Language | None = None


def get_nlp() -> spacy.Language:
    global _nlp  # noqa: PLW0603
    if _nlp is None:
        logger.info("spacy_loading")
        try:
            _nlp = spacy.load("en_core_web_lg")
        except OSError:
            _nlp = spacy.load("en_core_web_sm")
        logger.info(
            "spacy_loaded",
            pipeline=_nlp.pipe_names,
            model=_nlp.meta["name"],
        )
    return _nlp

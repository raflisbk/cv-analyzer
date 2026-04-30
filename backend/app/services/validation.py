"""Extraction quality validation."""

import re

from app.core.logging import structured_logger as logger


def validate_extraction_quality(text: str) -> tuple[float, str]:
    """
    Validate extraction quality using heuristics

    Args:
        text: Extracted text

    Returns:
        tuple of (quality_score 0.0-1.0, status_message)
    """
    # Minimum length check
    if len(text.strip()) < 50:
        logger.warning("Extraction too short", extra={"length": len(text)})
        return 0.1, "Extracted text too short (< 50 characters)"

    # Check for garbage/mojibake patterns
    mojibake_pattern = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]")
    mojibake_count = len(mojibake_pattern.findall(text))

    if mojibake_count > len(text) * 0.1:
        logger.warning(
            "High mojibake/garbage character count",
            extra={"mojibake_ratio": mojibake_count / len(text)},
        )
        return 0.2, "Extracted text contains too many invalid characters"

    # Check for reasonable word count
    words = text.split()
    if len(words) < 20:
        logger.warning("Word count too low", extra={"word_count": len(words)})
        return 0.3, "Extracted text has insufficient word count"

    # Check for common CV keywords
    cv_keywords = [
        "experience",
        "education",
        "skills",
        "work",
        "university",
        "resume",
        "cv",
        "email",
        "phone",
        "project",
        "certificate",
    ]
    text_lower = text.lower()
    keyword_matches = sum(1 for kw in cv_keywords if kw in text_lower)

    if keyword_matches < 2:
        logger.warning(
            "Few CV-related keywords found", extra={"keyword_matches": keyword_matches}
        )
        return 0.5, "Extracted text may not be a CV"

    # Calculate quality score
    length_score = min(len(text) / 1000, 1.0)  # Max at 1000 chars
    mojibake_score = 1.0 - (mojibake_count / max(len(text), 1))
    keyword_score = min(keyword_matches / 5, 1.0)

    quality_score = length_score * 0.3 + mojibake_score * 0.4 + keyword_score * 0.3

    logger.info(
        "Extraction quality validated",
        extra={
            "quality_score": quality_score,
            "length": len(text),
            "words": len(words),
            "keyword_matches": keyword_matches,
        },
    )

    return quality_score, "Good quality extraction"

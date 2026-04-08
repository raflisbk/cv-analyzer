"""
CV scoring orchestrator per D-07, SCORE-01..05.
Computes 4 dimension scores + overall using OpenAI cosine similarity.
Falls back to rule-based scoring when OpenAI is unavailable (no API key / Phase 2 dev).
"""

import re

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import score_dimension


# Dimension weights for overall score calculation (agent's discretion)
# Clarity (40%) + Impact (25%) + Completeness (20%) + Relevance (15%) = 100%
_DIMENSION_WEIGHTS: dict[str, float] = {
    "clarity": 0.40,
    "impact": 0.25,
    "completeness": 0.20,
    "relevance": 0.15,
}

# Rule-based fallback scoring keywords
_IMPACT_VERBS = [
    "achieved",
    "built",
    "created",
    "delivered",
    "designed",
    "developed",
    "drove",
    "grew",
    "implemented",
    "improved",
    "increased",
    "launched",
    "led",
    "managed",
    "optimized",
    "reduced",
    "saved",
    "scaled",
    "shipped",
]
_SECTION_KEYWORDS = [
    "experience",
    "education",
    "skills",
    "summary",
    "objective",
    "projects",
    "certifications",
    "awards",
    "publications",
    "contact",
]
_TECH_KEYWORDS = [
    "python",
    "javascript",
    "typescript",
    "java",
    "sql",
    "react",
    "node",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "api",
    "database",
    "agile",
    "machine learning",
    "data",
    "cloud",
    "linux",
    "ci/cd",
]


def _rule_based_score(text: str) -> dict:
    """
    Heuristic scorer used when OpenAI is unavailable (no API key configured).
    Scores 0-100 based on keyword presence, sentence structure, and section coverage.
    LLM embedding scoring replaces this in Phase 3.
    """
    lower = text.lower()
    words = lower.split()
    word_count = len(words)

    # Clarity: avg sentence length (shorter = clearer), bullet-point presence
    sentences = re.split(r"[.!?]+", text)
    non_empty = [s.strip() for s in sentences if s.strip()]
    avg_len = (
        (sum(len(s.split()) for s in non_empty) / len(non_empty)) if non_empty else 20
    )
    bullet_count = text.count("•") + text.count("-") + text.count("*")
    clarity = min(
        100,
        max(
            30,
            80
            - max(0, avg_len - 15) * 2  # penalise long sentences
            + min(20, bullet_count),  # reward bullet points
        ),
    )

    # Impact: action verbs and quantified achievements (numbers/%)
    verb_hits = sum(1 for v in _IMPACT_VERBS if v in lower)
    number_hits = len(re.findall(r"\b\d+[%x]?\b", text))
    impact = min(100, max(20, 40 + min(30, verb_hits * 5) + min(30, number_hits * 3)))

    # Completeness: section coverage
    section_hits = sum(1 for kw in _SECTION_KEYWORDS if kw in lower)
    length_score = min(20, word_count // 50)  # reward longer CVs up to 1000 words
    completeness = min(100, max(10, section_hits * 8 + length_score))

    # Relevance: technical and industry keywords
    tech_hits = sum(1 for kw in _TECH_KEYWORDS if kw in lower)
    relevance = min(100, max(20, 30 + min(70, tech_hits * 5)))

    overall = int(
        clarity * _DIMENSION_WEIGHTS["clarity"]
        + impact * _DIMENSION_WEIGHTS["impact"]
        + completeness * _DIMENSION_WEIGHTS["completeness"]
        + relevance * _DIMENSION_WEIGHTS["relevance"]
    )

    return {
        "overall": min(100, max(0, overall)),
        "clarity": int(clarity),
        "impact": int(impact),
        "completeness": int(completeness),
        "relevance": int(relevance),
        "scoring_method": "rule_based",  # Phase 3 will replace with "embedding"
    }


def score_cv(text: str) -> dict:
    """
    Score a CV across 4 dimensions.

    Primary: OpenAI text-embedding-3-small cosine similarity (D-07).
    Fallback: Rule-based heuristic scoring when OpenAI key is missing/invalid.

    Args:
        text: Full CV text (from job.result['text'])

    Returns:
        Dict with keys: overall, clarity, impact, completeness, relevance (all int 0-100)
    """
    settings = get_settings()
    openai_key = settings.CV_ANALYZER_OPENAI_API_KEY or ""

    # Use rule-based fallback if no API key configured (Phase 2 dev mode)
    if not openai_key or openai_key.startswith("your-"):
        logger.warning(
            "OpenAI API key not configured — using rule-based fallback scorer",
            extra={"text_length": len(text)},
        )
        scores = _rule_based_score(text)
        logger.info("Rule-based scoring complete", extra={"scores": scores})
        return scores

    logger.info("Scoring CV with OpenAI embeddings", extra={"text_length": len(text)})

    clarity = score_dimension(text, CLARITY_ANCHORS)
    impact = score_dimension(text, IMPACT_ANCHORS)
    completeness = score_dimension(text, COMPLETENESS_ANCHORS)
    relevance = score_dimension(text, RELEVANCE_ANCHORS)

    overall = int(
        clarity * _DIMENSION_WEIGHTS["clarity"]
        + impact * _DIMENSION_WEIGHTS["impact"]
        + completeness * _DIMENSION_WEIGHTS["completeness"]
        + relevance * _DIMENSION_WEIGHTS["relevance"]
    )
    overall = min(100, max(0, overall))

    scores = {
        "overall": overall,
        "clarity": clarity,
        "impact": impact,
        "completeness": completeness,
        "relevance": relevance,
        "scoring_method": "embedding",
    }

    logger.info("CV scoring complete", extra={"scores": scores})
    return scores

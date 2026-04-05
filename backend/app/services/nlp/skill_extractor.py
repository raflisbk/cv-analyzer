"""
Skill extraction service per D-03 and NLP-04.
Loads ESCO skills taxonomy CSV and uses rapidfuzz for fuzzy matching.
"""

import csv
from pathlib import Path

from rapidfuzz import fuzz, process

from app.core.logging import structured_logger as logger
from app.services.nlp.model import get_nlp


# ESCO CSV location — relative to this file's location
# backend/app/services/nlp/skill_extractor.py -> backend/data/esco_skills.csv
_ESCO_PATH = Path(__file__).parent.parent.parent.parent / "data" / "esco_skills.csv"

_ESCO_SKILLS: list[str] = []


def get_esco_skills() -> list[str]:
    """
    Lazy-load ESCO skills list as module-level singleton.
    Reads preferredLabel from ESCO CSV.
    Opens with utf-8-sig to handle BOM marker (Pitfall 6 in RESEARCH.md).
    """
    global _ESCO_SKILLS  # noqa: PLW0603
    if _ESCO_SKILLS:
        return _ESCO_SKILLS

    if not _ESCO_PATH.exists():
        logger.warning(
            "ESCO skills CSV not found",
            extra={"path": str(_ESCO_PATH)},
        )
        return []

    skills: list[str] = []
    with _ESCO_PATH.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            label = row.get("preferredLabel", "").strip()
            if label:
                skills.append(label)

            # Add alt labels if present (newline-separated in official ESCO CSV)
            alts = row.get("altLabels", "")
            if alts:
                for raw_alt in alts.split("\n"):
                    alt = raw_alt.strip()
                    if alt and alt not in skills:
                        skills.append(alt)

    _ESCO_SKILLS = skills
    logger.info("ESCO skills loaded", extra={"count": len(skills)})
    return _ESCO_SKILLS


_CHUNK_MIN_WORDS = 2
_CHUNK_MAX_WORDS = 4
_MIN_TOKEN_LEN = 2


def extract_skills(text: str, score_cutoff: int = 80) -> list[str]:
    """
    Extract skills from CV text using ESCO taxonomy fuzzy matching per D-03, NLP-04.

    Strategy:
    1. Extract candidate tokens from spaCy noun chunks + filtered tokens
    2. Fuzzy-match each candidate against ESCO skills list
    3. Return canonical preferredLabel names (sorted, deduplicated)

    Args:
        text: CV text to analyze
        score_cutoff: Minimum fuzzy match score (0-100). Default 80 reduces false positives.

    Returns:
        Sorted list of matched ESCO skill names.
    """
    nlp = get_nlp()
    doc = nlp(text)
    esco_skills = get_esco_skills()

    if not esco_skills:
        logger.warning("ESCO skills list is empty — skill extraction skipped")
        return []

    # Build candidate set from noun chunks (2-4 words) + individual alpha tokens
    candidates: set[str] = set()
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
        word_count = len(chunk_text.split())
        if _CHUNK_MIN_WORDS <= word_count <= _CHUNK_MAX_WORDS:
            candidates.add(chunk_text)

    for token in doc:
        if token.is_alpha and not token.is_stop and len(token.text) > _MIN_TOKEN_LEN:
            candidates.add(token.text.strip())

    # Fuzzy-match candidates against ESCO skill list
    matched: set[str] = set()
    for candidate in candidates:
        result = process.extractOne(
            candidate,
            esco_skills,
            scorer=fuzz.token_sort_ratio,
            score_cutoff=score_cutoff,
        )
        if result:
            matched.add(result[0])  # Add canonical skill name

    return sorted(matched)

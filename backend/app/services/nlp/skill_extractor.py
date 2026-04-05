"""
Skill extraction service per D-03 and NLP-04.
Loads ESCO skills taxonomy CSV and uses rapidfuzz for fuzzy matching.
Single-word tech skills use a curated whitelist; multi-word phrases use ESCO fuzzy match.
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

# Curated whitelist for single-word tech/professional skills.
# ESCO fuzzy matching is too noisy for single words (14K entries span all industries).
_SINGLE_WORD_WHITELIST: set[str] = {
    # Languages
    "python", "java", "javascript", "typescript", "go", "rust", "swift", "kotlin",
    "ruby", "scala", "php", "perl", "r", "matlab", "c", "c++", "c#",
    # Web / Frontend
    "react", "angular", "vue", "nextjs", "svelte", "html", "css", "sass",
    "tailwind", "bootstrap", "webpack", "vite",
    # Backend / Cloud
    "fastapi", "django", "flask", "express", "nestjs", "springboot", "rails",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible",
    "nginx", "linux", "bash", "git", "github", "gitlab", "ci/cd",
    # Data / ML
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "pandas", "numpy", "tensorflow", "pytorch", "sklearn", "spark", "kafka",
    "airflow", "dbt", "tableau", "powerbi",
    # Methods / Soft skills (only the unambiguous ones)
    "agile", "scrum", "kanban", "devops", "mlops", "tdd", "rest", "graphql",
}


def get_esco_skills() -> list[str]:
    """
    Lazy-load ESCO skills list as module-level singleton.
    Reads preferredLabel from ESCO CSV.
    Opens with utf-8-sig to handle BOM marker (Pitfall 6 in RESEARCH.md).
    Only loads multi-word skills (2+ words) to avoid noise from single-word fuzzy matching.
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
            # Only include multi-word skills to avoid single-word ESCO noise
            if label and len(label.split()) >= 2:  # noqa: PLR2004
                skills.append(label)

    _ESCO_SKILLS = skills
    logger.info("ESCO skills loaded (multi-word only)", extra={"count": len(skills)})
    return _ESCO_SKILLS


_CHUNK_MIN_WORDS = 2
_CHUNK_MAX_WORDS = 4
_MIN_TOKEN_LEN = 2


def extract_skills(text: str, score_cutoff: int = 85) -> list[str]:
    """
    Extract skills from CV text using two strategies:

    1. Single-word: exact match (case-insensitive) against curated tech whitelist.
       Avoids false positives from ESCO fuzzy matching across 14K non-tech skills.

    2. Multi-word noun chunks: fuzzy match against ESCO multi-word skills with
       cutoff=85 using WRatio (better than token_sort_ratio for phrases).

    Args:
        text: CV text to analyze
        score_cutoff: Minimum fuzzy score for ESCO phrase matching (default 85).

    Returns:
        Sorted list of matched skill names (title-cased for display).
    """
    nlp = get_nlp()
    doc = nlp(text)
    esco_skills = get_esco_skills()

    matched: set[str] = set()

    # Strategy 1: Single-word whitelist (exact, case-insensitive)
    for token in doc:
        if token.is_alpha and not token.is_stop and len(token.text) > _MIN_TOKEN_LEN:
            lower = token.text.lower()
            if lower in _SINGLE_WORD_WHITELIST:
                # Title-case for display (e.g. "python" → "Python")
                matched.add(token.text.strip().title())

    if not esco_skills:
        logger.warning("ESCO skills list is empty — ESCO phrase matching skipped")
        return sorted(matched)

    # Strategy 2: Multi-word noun chunks fuzzy-matched against ESCO
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
        word_count = len(chunk_text.split())
        if _CHUNK_MIN_WORDS <= word_count <= _CHUNK_MAX_WORDS:
            result = process.extractOne(
                chunk_text,
                esco_skills,
                scorer=fuzz.WRatio,
                score_cutoff=score_cutoff,
            )
            if result:
                matched.add(result[0])  # Canonical ESCO preferredLabel

    logger.info("Skill extraction complete", extra={"count": len(matched)})
    return sorted(matched)

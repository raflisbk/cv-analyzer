"""JD keyword gap analysis — identify what's in the JD but missing from CV.

No external APIs needed: uses regex + term frequency to extract keywords
from the job description and checks presence against the CV.
"""

import re
from collections import Counter

# Tech keywords and skill patterns to extract from JD
_TECH_TERM = re.compile(
    r"\b(?:"
    # Programming languages
    r"python|javascript|typescript|java|kotlin|swift|go|golang|rust|ruby|php|c\+\+|c#|r\b|scala|"
    # Frameworks / libraries
    r"react|vue|angular|next\.?js|fastapi|django|flask|spring|express|rails|laravel|"
    r"tensorflow|pytorch|keras|scikit-learn|pandas|numpy|langchain|hugging ?face|"
    # Cloud & infra
    r"aws|azure|gcp|google cloud|kubernetes|docker|terraform|ansible|"
    # Data
    r"sql|postgresql|mysql|mongodb|redis|elasticsearch|kafka|spark|hadoop|dbt|"
    # AI/ML
    r"machine learning|deep learning|nlp|computer vision|llm|generative ai|rag|"
    r"bert|gpt|transformer|fine-tuning|mlops|"
    # Tools
    r"git|ci/cd|jenkins|github actions|jira|figma|notion|"
    # Soft skills / roles
    r"leadership|communication|agile|scrum|product management|project management"
    r")\b",
    re.IGNORECASE,
)

# Multi-word skill phrases (checked via simple substring match)
_PHRASE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b" + re.escape(phrase) + r"\b", re.IGNORECASE)
    for phrase in [
        "machine learning",
        "deep learning",
        "natural language processing",
        "computer vision",
        "data engineering",
        "software engineering",
        "cloud computing",
        "data science",
        "product management",
        "project management",
        "software architecture",
        "system design",
        "microservices",
        "distributed systems",
        "real-time processing",
        "ci/cd",
        "devops",
        "mlops",
        "object detection",
    ]
]

# Noise words to exclude from keyword extraction
_STOP_WORDS: set[str] = {
    "the",
    "and",
    "or",
    "for",
    "with",
    "this",
    "that",
    "have",
    "will",
    "from",
    "they",
    "been",
    "has",
    "are",
    "was",
    "not",
    "but",
    "can",
    "you",
    "your",
    "our",
    "its",
    "be",
    "by",
    "as",
    "at",
    "an",
    "is",
    "in",
    "on",
    "to",
    "of",
    "a",
}


def _extract_jd_keywords(jd_text: str) -> list[tuple[str, int]]:
    """Extract tech/skill keywords from JD, sorted by frequency."""
    jd_lower = jd_text.lower()

    found: Counter = Counter()

    # Single-word tech terms
    for m in _TECH_TERM.finditer(jd_lower):
        found[m.group().lower()] += 1

    # Multi-word phrases
    for pat in _PHRASE_PATTERNS:
        for m in pat.finditer(jd_lower):
            found[m.group().lower()] += 1

    # Also extract capitalized 2-word combos like "Product Manager", "Data Scientist"
    for m in re.finditer(r"\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b", jd_text):
        term = m.group().lower()
        if all(w not in _STOP_WORDS for w in term.split()):
            found[term] += 1

    # Keep only terms that appear 1+ time
    return sorted(found.items(), key=lambda x: -x[1])


def compute_jd_keyword_gaps(
    jd_text: str,
    cv_text: str,
    cv_skills: list[str] | None = None,
) -> dict:
    """Extract keywords from JD and identify which are absent from the CV.

    Returns matched/missing keyword lists and a match ratio.
    """
    if not jd_text:
        return {
            "matched_keywords": [],
            "missing_keywords": [],
            "match_ratio": 0.0,
            "keyword_count": 0,
        }

    jd_keywords = _extract_jd_keywords(jd_text)
    cv_lower = cv_text.lower()
    cv_skill_lower = {s.lower() for s in (cv_skills or [])}

    matched: list[str] = []
    missing: list[str] = []

    seen: set[str] = set()
    for kw, _freq in jd_keywords:
        if kw in seen:
            continue
        seen.add(kw)
        in_cv = kw in cv_skill_lower or kw in cv_lower
        if in_cv:
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(matched) + len(missing)
    match_ratio = round(len(matched) / total, 3) if total else 0.0

    return {
        "matched_keywords": matched[:20],
        "missing_keywords": missing[:20],
        "match_ratio": match_ratio,
        "keyword_count": total,
    }

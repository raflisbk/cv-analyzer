"""Extract skills, named entities and the primary role from CV text in one LLM call."""

import hashlib
import json
import re
from typing import Any

import httpx
import json_repair

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.params import reasoning_params
from app.services.nlp.section_detector import CvSection
from app.services.scoring.llm_scorer import _cache_get, _cache_set

PROFILE_VERSION = "p1"

_MAX_CV_CHARS = 12000
_MAX_SKILLS = 60
_MAX_ROLE_WORDS = 6

_ENTITY_LABELS: dict[str, str] = {
    "organizations": "ORG",
    "dates": "DATE",
    "persons": "PERSON",
    "locations": "GPE",
}

_PROMPT = """\
Read the CV below and extract a structured profile.

Return ONLY a JSON object with exactly these keys:
{{
  "detected_role": "<primary job role or target position in 2-5 words, or null>",
  "skills": ["<skill>", ...],
  "entities": {{
    "organizations": ["<company, university or institution>", ...],
    "dates": ["<date or date range as written>", ...],
    "persons": ["<person name>", ...],
    "locations": ["<city, region or country>", ...]
  }}
}}

Rules:
- skills: technical skills, tools, frameworks, languages, methods and domain skills. Copy each skill EXACTLY as written in the CV (same spelling and casing). Never invent or normalise skills that are not in the text. At most {max_skills}, no duplicates.
- entities: copy each value exactly as written in the CV. No duplicates.
- detected_role: the role they are actively pursuing or most recently held. Prefer an explicit title or objective line. Be specific ("Data Scientist", not "Engineer"). No seniority words unless it is the only distinguishing factor.
- Respond with the JSON object only, no commentary.

CV:
{cv_text}"""


def _empty_profile() -> dict[str, Any]:
    return {
        "skills": [],
        "entities": {kind: [] for kind in _ENTITY_LABELS},
        "detected_role": None,
    }


def _cache_key(cv_text: str, model: str) -> str:
    digest = hashlib.sha256(cv_text.encode()).hexdigest()[:24]
    return f"cv_profile:{PROFILE_VERSION}:{model}:{digest}"


def _parse_json(raw: str) -> dict[str, Any] | None:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        data = json_repair.loads(match.group(0))
    return data if isinstance(data, dict) else None


def _verbatim_unique(values: Any, cv_text: str, limit: int | None = None) -> list[str]:
    if not isinstance(values, list):
        return []
    haystack = cv_text.lower()
    seen: dict[str, str] = {}
    for value in values:
        if not isinstance(value, str):
            continue
        cleaned = value.strip()
        key = cleaned.lower()
        if cleaned and key in haystack and key not in seen:
            seen[key] = cleaned
    ordered = sorted(seen.values(), key=str.lower)
    return ordered[:limit] if limit else ordered


def _clean_role(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    role = value.strip(" .,\n\"'")
    if not role or len(role.split()) > _MAX_ROLE_WORDS:
        return None
    return role


def _normalise(data: dict[str, Any], cv_text: str) -> dict[str, Any]:
    raw_entities = data.get("entities")
    entities = raw_entities if isinstance(raw_entities, dict) else {}
    return {
        "skills": _verbatim_unique(data.get("skills"), cv_text, _MAX_SKILLS),
        "entities": {
            kind: _verbatim_unique(entities.get(kind), cv_text)
            for kind in _ENTITY_LABELS
        },
        "detected_role": _clean_role(data.get("detected_role")),
    }


def _request_profile(cv_text: str) -> dict[str, Any] | None:
    settings = get_settings()
    prompt = _PROMPT.format(max_skills=_MAX_SKILLS, cv_text=cv_text)
    with httpx.Client(timeout=60.0) as client:
        resp = client.post(
            f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
            json={
                "model": settings.CV_ANALYZER_LLM_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2000,
                "temperature": 0.1,
                **reasoning_params(),
            },
        )
        resp.raise_for_status()
        return _parse_json(resp.json()["choices"][0]["message"]["content"])


def extract_cv_profile(cv_text: str) -> dict[str, Any]:
    """Return {skills, entities, detected_role}; empty values when the LLM is unavailable."""
    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY or not cv_text.strip():
        return _empty_profile()

    text = cv_text[:_MAX_CV_CHARS]
    key = _cache_key(text, settings.CV_ANALYZER_LLM_MODEL)
    cached = _cache_get(key, settings)
    if cached:
        return cached

    try:
        data = _request_profile(text)
    except Exception as exc:
        logger.error("cv_profile_request_failed", error=str(exc))
        return _empty_profile()

    if data is None:
        logger.warning("cv_profile_unparseable")
        return _empty_profile()

    profile = _normalise(data, text)
    _cache_set(key, profile, settings)
    logger.info(
        "cv_profile_extracted",
        skills=len(profile["skills"]),
        role=profile["detected_role"],
    )
    return profile


def attach_entities(sections: list[CvSection], entities: dict[str, list[str]]) -> None:
    for section in sections:
        body = section.text.lower()
        section.entities = [
            {"text": value, "label": label, "type": kind}
            for kind, label in _ENTITY_LABELS.items()
            for value in entities.get(kind, [])
            if value.lower() in body
        ]

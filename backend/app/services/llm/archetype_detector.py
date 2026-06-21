"""Two-tier universal archetype detection from CV text.

Tier 1 — detect domain (30 options, short prompt)
Tier 2 — detect archetype within that domain (20–70 options, compact prompt)

Total: 2 LLM calls per CV, each fast (max_tokens 60 / 120).
Covers all Indonesian professional roles from blue-collar to executive.
"""

from __future__ import annotations

import json
import re

import httpx

from app.core.logging import structured_logger as logger
from app.services.llm.archetype_registry import (
    REGISTRY,
    get_archetype_list,
    get_description,
    get_display_name,
    get_domain_list,
    total_archetypes,
)

# Re-export ARCHETYPES as alias for backward-compat (old tests may import it)
ARCHETYPES = {domain: data["archetypes"] for domain, data in REGISTRY.items()}

_DOMAIN_PROMPT = """\
Identify the professional domain that best fits this CV.

Domains:
{domain_list}

Return ONLY JSON: {{"domain": "<domain_key>", "confidence": "<high|medium|low>"}}

If no domain fits, return {{"domain": "none", "confidence": "low"}}

CV (first 2000 chars):
{cv_text}"""

_ARCHETYPE_PROMPT = """\
Domain already identified: {domain} ({domain_display})

Choose the single best-fitting archetype from this list:
{archetype_list}

Return ONLY JSON: {{"archetype": "<archetype_key>", "confidence": "<high|medium|low>", "reasoning": "<1-2 sentences citing CV evidence>"}}

CV (first 2500 chars):
{cv_text}"""


def _llm_call(
    prompt: str,
    max_tokens: int,
    settings,
    timeout: float = 20.0,
) -> str | None:
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"
                },
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        logger.warning("archetype_llm_call_failed", error=str(exc))
        return None


def _detect_domain(cv_text: str, settings) -> tuple[str, str] | None:
    """Tier 1: returns (domain_key, confidence) or None."""
    prompt = _DOMAIN_PROMPT.format(
        domain_list=get_domain_list(),
        cv_text=cv_text[:2000].strip(),
    )
    raw = _llm_call(prompt, max_tokens=60, settings=settings)
    if not raw:
        return None

    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group())
        domain = data.get("domain", "none")
        confidence = data.get("confidence", "medium")
        if domain == "none" or domain not in REGISTRY:
            return None
        return domain, confidence
    except (json.JSONDecodeError, KeyError):
        return None


def _detect_archetype_in_domain(
    cv_text: str,
    domain: str,
    settings,
) -> dict | None:
    """Tier 2: returns {archetype, confidence, reasoning} or None."""
    prompt = _ARCHETYPE_PROMPT.format(
        domain=domain,
        domain_display=REGISTRY[domain]["display_name"],
        archetype_list=get_archetype_list(domain),
        cv_text=cv_text[:2500].strip(),
    )
    raw = _llm_call(prompt, max_tokens=150, settings=settings)
    if not raw:
        return None

    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group())
        archetype = data.get("archetype", "")
        if not archetype or archetype not in REGISTRY.get(domain, {}).get(
            "archetypes", {}
        ):
            return None
        return {
            "archetype": archetype,
            "confidence": data.get("confidence", "medium"),
            "reasoning": data.get("reasoning", ""),
        }
    except (json.JSONDecodeError, KeyError):
        return None


def detect_archetype(cv_text: str, detected_role: str | None = None) -> dict | None:
    """Detect professional domain and archetype for any CV.

    Returns dict with domain, domain_display, type, display_name,
    confidence, reasoning, description — or None on failure.
    """
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    domain_result = _detect_domain(cv_text, settings)
    if not domain_result:
        logger.info("archetype_domain_not_detected", role=detected_role)
        return None

    domain, domain_confidence = domain_result

    archetype_result = _detect_archetype_in_domain(cv_text, domain, settings)
    if not archetype_result:
        logger.info(
            "archetype_not_detected_in_domain", domain=domain, role=detected_role
        )
        return None

    archetype = archetype_result["archetype"]
    result = {
        "domain": domain,
        "domain_display": REGISTRY[domain]["display_name"],
        "type": archetype,
        "display_name": get_display_name(archetype),
        "confidence": archetype_result["confidence"],
        "reasoning": archetype_result["reasoning"],
        "description": get_description(domain, archetype),
    }
    logger.info(
        "archetype_detected",
        domain=domain,
        archetype=archetype,
        confidence=archetype_result["confidence"],
        role=detected_role,
    )
    return result

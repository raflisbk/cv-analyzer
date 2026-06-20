"""LLM-generated anchor phrases for arbitrary job roles, cached in Redis."""

import json
import re

import httpx
import redis as redis_sync

from app.core.logging import structured_logger as logger

_ANCHOR_CACHE_TTL = 7 * 24 * 3600  # 7 days
_DIMENSIONS = ("clarity", "impact", "completeness", "relevance")


def _normalize_role(role: str) -> str:
    return re.sub(r"[^a-z0-9_]", "_", role.lower().strip())[:64]


def get_all_dynamic_anchors(role_title: str) -> dict[str, list[str]] | None:
    """Return anchor phrases for all 4 dimensions for the given role title.

    Tries Redis cache first; on miss, calls LLM and caches result.
    Returns None if LLM fails so caller can fall back to generic anchors.
    """
    normalized = _normalize_role(role_title)
    cache_key = f"role_anchors_all:{normalized}"

    try:
        from app.core.config import get_settings

        r = redis_sync.from_url(get_settings().CV_ANALYZER_REDIS_URL, decode_responses=True)
        cached = r.get(cache_key)
        if cached:
            logger.info("dynamic_anchors_cache_hit", role=role_title, key=cache_key)
            return json.loads(cached)
    except Exception as e:
        logger.warning("dynamic_anchors_cache_read_failed", role=role_title, error=str(e))

    result = _generate_via_llm(role_title)
    if result:
        try:
            from app.core.config import get_settings

            r = redis_sync.from_url(get_settings().CV_ANALYZER_REDIS_URL, decode_responses=True)
            r.setex(cache_key, _ANCHOR_CACHE_TTL, json.dumps(result))
            logger.info("dynamic_anchors_cached", role=role_title, key=cache_key)
        except Exception as e:
            logger.warning("dynamic_anchors_cache_write_failed", role=role_title, error=str(e))

    return result


def _generate_via_llm(role_title: str) -> dict[str, list[str]] | None:
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    prompt = (
        f"Generate CV anchor phrases for scoring a **{role_title}** candidate across 4 dimensions.\n"
        f"For each dimension, generate 3 realistic CV excerpt snippets that demonstrate excellence "
        f"for a {role_title} role:\n"
        f"- clarity: clear structure, professional writing, well-organised sections\n"
        f"- impact: quantified achievements with specific numbers relevant to {role_title}\n"
        f"- completeness: all expected sections for a {role_title} CV\n"
        f"- relevance: key skills, tools, certifications, and domain knowledge for {role_title}\n\n"
        f'Return ONLY a JSON object with this exact structure:\n'
        f'{{"clarity": ["...", "...", "..."], "impact": ["...", "...", "..."], '
        f'"completeness": ["...", "...", "..."], "relevance": ["...", "...", "..."]}}'
    )

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1500,
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]

            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                logger.warning("dynamic_anchors_no_json", role=role_title, content=content[:200])
                return None

            data = json.loads(match.group())
            result: dict[str, list[str]] = {}
            for dim in _DIMENSIONS:
                anchors = data.get(dim, [])
                if isinstance(anchors, list) and anchors:
                    result[dim] = [str(a) for a in anchors[:4]]

            if not result:
                return None

            logger.info(
                "dynamic_anchors_generated",
                role=role_title,
                dims_generated=list(result.keys()),
            )
            return result

    except Exception as e:
        logger.error("dynamic_anchor_generation_failed", role=role_title, error=str(e))
        return None

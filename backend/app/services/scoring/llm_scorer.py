"""LLM-based CV scoring — replaces embedding cosine-similarity approach.

Scores all 4 dimensions in a single LLM call, calibrated to the candidate's
evident experience level so junior and senior CVs are judged fairly.
Reasoning per dimension is included in the response — no separate explainer
call needed.
"""

import json
import re

import httpx

from app.core.logging import structured_logger as logger

_WEIGHTS = {
    "clarity": 0.40,
    "impact": 0.25,
    "completeness": 0.20,
    "relevance": 0.15,
}

_PROMPT = """\
You are an expert CV/resume evaluator. Score the CV below on 4 dimensions.

Target Role: {role}
{jd_section}
CV:
{cv_text}

Score each dimension from 0 to 100:

- clarity (weight 40%): Structure, readability, and how clearly achievements are communicated. Is the CV easy to scan? Are bullet points specific and well-written?
- impact (weight 25%): Measurable results and achievements. Does the CV show concrete outcomes (%, numbers, scale, before/after)?
- completeness (weight 20%): Coverage of key sections — contact info, summary/objective, work experience with dates, education, skills, and projects.
- relevance (weight 15%): How well the skills, experience, and projects match the target role.

CALIBRATION — score relative to the candidate's evident experience level, NOT against an absolute senior standard:
- 0–40  : Poor (major gaps, very unclear, or not relevant)
- 41–60 : Below average (some good elements but significant room to improve)
- 61–75 : Average (solid CV at this experience level, minor gaps)
- 76–85 : Good (stands out at this experience level)
- 86–100: Excellent (exceptional for their experience level)

A junior with 1 year of experience who demonstrates clear projects and some measurable results should score 65–75 on impact — not 30.

Respond with ONLY a JSON object, no markdown fences, no extra text:
{{
  "clarity": <integer 0-100>,
  "impact": <integer 0-100>,
  "completeness": <integer 0-100>,
  "relevance": <integer 0-100>,
  "reasoning": {{
    "clarity": "<1-2 sentences>",
    "impact": "<1-2 sentences>",
    "completeness": "<1-2 sentences>",
    "relevance": "<1-2 sentences>"
  }}
}}\
"""


def _extract_json(text: str) -> dict:
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Cannot extract JSON from LLM output: {text[:300]!r}")


def score_cv_with_llm(
    cv_text: str,
    target_role: str | None = None,
    jd_text: str | None = None,
) -> dict:
    from app.core.config import get_settings

    settings = get_settings()
    role_label = target_role or "General Professional"
    cv_slice = cv_text[:4000]

    jd_section = ""
    if jd_text:
        jd_section = f"Job Description (use for relevance scoring):\n{jd_text[:2000]}\n"

    prompt = _PROMPT.format(role=role_label, cv_text=cv_slice, jd_section=jd_section)

    logger.info("llm_scoring_request", role=role_label, cv_len=len(cv_slice), jd=bool(jd_text))

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 600,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error("llm_scoring_request_failed", error=str(e))
        return _fallback_scores(target_role)

    try:
        data = _extract_json(raw)
    except ValueError:
        logger.error("llm_scoring_parse_failed", raw=raw[:300])
        return _fallback_scores(target_role)

    dims = ["clarity", "impact", "completeness", "relevance"]
    scores: dict[str, int] = {}
    for dim in dims:
        val = data.get(dim)
        try:
            scores[dim] = max(0, min(100, int(val)))
        except (TypeError, ValueError):
            logger.warning("llm_scoring_invalid_dim", dim=dim, val=val)
            scores[dim] = 50

    overall = max(0, min(100, int(sum(scores[d] * _WEIGHTS[d] for d in dims))))

    reasonings: dict[str, str] = {}
    if isinstance(data.get("reasoning"), dict):
        reasonings = {d: str(data["reasoning"].get(d, "")) for d in dims}

    logger.info("llm_scoring_done", overall=overall, role=role_label, **scores)

    return {
        "overall": overall,
        **scores,
        "reasonings": reasonings,
        "scoring_method": "llm",
        "provider": "koboi",
        "jd_relevance": bool(jd_text),
        "target_role": target_role,
    }


def _fallback_scores(target_role: str | None) -> dict:
    logger.warning("llm_scoring_fallback_used", role=target_role)
    return {
        "overall": 50,
        "clarity": 50,
        "impact": 50,
        "completeness": 50,
        "relevance": 50,
        "reasonings": {},
        "scoring_method": "fallback",
        "provider": "koboi",
        "jd_relevance": False,
        "target_role": target_role,
    }

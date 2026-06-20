"""LLM-based CV scoring — calibrated to experience level and role category.

Supports ensemble scoring (configurable N runs, median per dimension)
to reduce inherent LLM non-determinism. Set CV_ANALYZER_SCORING_ENSEMBLE_RUNS=3
to enable; defaults to 1 (single run, fastest).
"""

import json
import re
import statistics

import httpx

from app.core.logging import structured_logger as logger
from app.services.scoring.text_normalizer import normalize_cv_text

_WEIGHTS = {
    "impact": 0.35,
    "clarity": 0.30,
    "relevance": 0.20,
    "completeness": 0.15,
}

_IMPACT_GUIDANCE: dict[str, str] = {
    "design": (
        "For design roles, impact includes: design system coverage/adoption, "
        "usability improvements, reduction in design-to-dev handoff friction, "
        "user research quality, portfolio breadth, and measurable UX outcomes "
        "(e.g. task success rate, NPS, design iteration speed)."
    ),
    "marketing": (
        "For marketing roles, impact includes: reach, engagement rate, "
        "conversion rate improvements, campaign ROI, growth metrics, "
        "cost-per-acquisition reductions, and audience growth."
    ),
    "management": (
        "For management/product roles, impact includes: team size led, "
        "projects delivered on time/budget, stakeholder alignment, "
        "process improvements, OKR/KPI achievement, and cross-functional outcomes."
    ),
    "engineering": (
        "For engineering roles, impact includes: performance improvements (%, latency, throughput), "
        "cost savings, system scale (users, requests/day), reliability metrics (uptime, error rate), "
        "and delivered business outcomes (revenue, cost reduction)."
    ),
    "general": (
        "Impact includes any measurable outcomes relevant to the role: "
        "numbers, percentages, scale, before/after comparisons, or business results."
    ),
}

_PROMPT = """\
You are an expert CV/resume evaluator. Score the CV below on 4 dimensions.

Target Role: {role}
{jd_section}
CV:
{cv_text}

Score each dimension from 0 to 100:

- impact (weight 35%): Measurable results and achievements. Does the CV show concrete outcomes?
  {impact_guidance}
- clarity (weight 30%): Structure, readability, and how clearly achievements are communicated.
  NOTE: Ignore minor spacing or line-break inconsistencies that may come from PDF conversion — focus on whether content and structure are easy to understand.
- relevance (weight 20%): How well the skills, experience, and projects match the target role.
- completeness (weight 15%): Coverage of key sections — contact info, summary, work experience with dates, education, and skills.

CALIBRATION — score relative to the candidate's evident experience level:
- 0–40  : Poor (major gaps, very unclear, or not relevant)
- 41–60 : Below average (some strengths but significant room to improve)
- 61–75 : Average (solid for their level, minor gaps)
- 76–85 : Good (stands out at their level)
- 86–100: Excellent (exceptional for their experience level)

A junior (1–2 years) who clearly demonstrates relevant projects and some measurable results should score 65–75 on impact — not below 50.

Respond with ONLY a JSON object, no markdown fences, no text outside JSON:
{{
  "impact": <integer 0-100>,
  "clarity": <integer 0-100>,
  "relevance": <integer 0-100>,
  "completeness": <integer 0-100>,
  "reasoning": {{
    "impact": "<1-2 sentences>",
    "clarity": "<1-2 sentences>",
    "relevance": "<1-2 sentences>",
    "completeness": "<1-2 sentences>"
  }}
}}\
"""


def _role_category(role: str | None) -> str:
    if not role:
        return "general"
    r = role.lower()
    if any(w in r for w in ["design", "ux", "ui ", "ui/ux", "visual", "creative", "brand"]):
        return "design"
    if any(w in r for w in ["marketing", "growth", "content", "seo", "social media", "copywrite"]):
        return "marketing"
    if any(w in r for w in ["manager", "product manager", "project manager", "scrum", "operations", "program"]):
        return "management"
    return "engineering"


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


def _median_int(values: list[int]) -> int:
    if len(values) == 1:
        return values[0]
    return int(statistics.median(values))


def _single_llm_call(prompt: str, settings) -> dict | None:
    """Execute one LLM scoring call. Returns parsed dict or None on failure."""
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
        return None

    try:
        return _extract_json(raw)
    except ValueError:
        logger.error("llm_scoring_parse_failed", raw=raw[:300])
        return None


def score_cv_with_llm(
    cv_text: str,
    target_role: str | None = None,
    jd_text: str | None = None,
) -> dict:
    from app.core.config import get_settings

    settings = get_settings()
    role_label = target_role or "General Professional"
    category = _role_category(target_role)
    cv_slice = normalize_cv_text(cv_text)[:4000]

    jd_section = ""
    if jd_text:
        jd_section = f"Job Description (use for relevance scoring):\n{jd_text[:2000]}\n"

    prompt = _PROMPT.format(
        role=role_label,
        cv_text=cv_slice,
        jd_section=jd_section,
        impact_guidance=_IMPACT_GUIDANCE[category],
    )

    n_runs = max(1, settings.CV_ANALYZER_SCORING_ENSEMBLE_RUNS)
    logger.info(
        "llm_scoring_request",
        role=role_label,
        category=category,
        cv_len=len(cv_slice),
        ensemble_runs=n_runs,
    )

    dims = list(_WEIGHTS.keys())
    all_raw: list[dict] = []

    for run_i in range(n_runs):
        result = _single_llm_call(prompt, settings)
        if result is not None:
            all_raw.append(result)
        else:
            logger.warning("llm_scoring_run_failed", run=run_i + 1, total=n_runs)

    if not all_raw:
        return _fallback_scores(target_role)

    # Per-dimension median across all successful runs
    scores: dict[str, int] = {}
    score_ranges: dict[str, int] = {}
    for dim in dims:
        vals: list[int] = []
        for raw in all_raw:
            val = raw.get(dim)
            try:
                vals.append(max(0, min(100, int(val))))
            except (TypeError, ValueError):
                vals.append(50)
        scores[dim] = _median_int(vals)
        score_ranges[dim] = max(vals) - min(vals)

    overall = max(0, min(100, int(sum(scores[d] * _WEIGHTS[d] for d in dims))))

    # Use reasoning from the first successful run
    reasonings: dict[str, str] = {}
    if isinstance(all_raw[0].get("reasoning"), dict):
        reasonings = {d: str(all_raw[0]["reasoning"].get(d, "")) for d in dims}

    logger.info(
        "llm_scoring_done",
        overall=overall,
        role=role_label,
        category=category,
        ensemble_runs=len(all_raw),
        **scores,
    )

    return {
        "overall": overall,
        **scores,
        "reasonings": reasonings,
        "scoring_method": "llm",
        "provider": "koboi",
        "jd_relevance": bool(jd_text),
        "target_role": target_role,
        "ensemble_runs": len(all_raw),
        # score_ranges: per-dim max-min spread across runs. High = low confidence.
        "score_ranges": score_ranges if len(all_raw) > 1 else {},
    }


def _fallback_scores(target_role: str | None) -> dict:
    logger.warning("llm_scoring_fallback_used", role=target_role)
    return {
        "overall": 50,
        "impact": 50,
        "clarity": 50,
        "relevance": 50,
        "completeness": 50,
        "reasonings": {},
        "scoring_method": "fallback",
        "provider": "koboi",
        "jd_relevance": False,
        "target_role": target_role,
        "ensemble_runs": 0,
        "score_ranges": {},
    }

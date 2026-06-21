"""Job posting red flags analysis.

Detects warning signals in JD text:
- Unrealistic requirements (e.g. "10 years Kubernetes")
- Missing compensation info
- Vague/generic template language
- Burnout culture signals ("fast-paced", "wear many hats")
- Seniority mismatch (junior title + senior responsibilities)
"""

import json
import re

import httpx

from app.core.logging import structured_logger as logger

_PROMPT = """\
Analyze this job description for red flags. Check these categories:

1. requirements_realism: Are experience/skill requirements proportionate?
   (e.g. "10 years in Kubernetes" is suspicious — Kubernetes launched in 2014;
   "5 years React" for a junior role is unrealistic — calibrate to tool age)
2. compensation_transparency: Is salary/compensation range explicitly stated?
3. jd_specificity: Is this specific to the company, or a vague copy-paste template?
4. culture_signals: Phrases like "fast-paced", "wear many hats", "self-starter",
   "no 9-to-5", "startup mentality" may indicate understaffed/burnout culture.
5. requirements_mismatch: Does the title/seniority match the listed responsibilities?
   (e.g. "Junior Developer" requiring "5+ years leading teams" is a red flag)

Return ONLY valid JSON:
{{
  "red_flags": [
    {{
      "flag": "<short flag name, snake_case>",
      "severity": "<warning|info>",
      "detail": "<specific observation from the JD, max 120 chars>"
    }}
  ],
  "overall_quality": "<good|fair|poor>",
  "quality_reasoning": "<1-2 sentences>"
}}

Rules:
- Only include flags that are actually present in this JD
- "warning" = significant concern, "info" = minor note worth knowing
- If no red flags found, return empty array with overall_quality "good"
- Quote specific phrases from the JD in your detail

Job Description:
{jd_text}"""


def analyze_jd_red_flags(jd_text: str) -> dict | None:
    """Analyze JD text for red flags. Returns result dict or None on failure/skip."""
    if len(jd_text.strip()) < 100:
        return None

    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    prompt = _PROMPT.format(jd_text=jd_text[:3000])

    try:
        with httpx.Client(timeout=25.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"
                },
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 600,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"].strip()

        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            logger.warning("jd_analyzer_no_json", raw=raw[:200])
            return None

        data = json.loads(match.group())
        logger.info(
            "jd_analyzed",
            flags=len(data.get("red_flags", [])),
            quality=data.get("overall_quality"),
        )
        return data

    except Exception as e:
        logger.warning("jd_analysis_failed", error=str(e))
        return None

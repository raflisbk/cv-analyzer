"""Detect the primary job role / target position from CV text via LLM."""

import re

import httpx

from app.core.logging import structured_logger as logger

_PROMPT = """\
Read the CV below and identify the person's PRIMARY job role or target position in 2-5 words.

Rules:
- Return ONLY the role title, nothing else (e.g. "Machine Learning Engineer", "UI/UX Designer", "Backend Engineer", "Product Manager")
- Use the role they are actively pursuing or their most recent/primary role
- If the CV has an explicit objective/title line, prefer that
- Be specific: "Data Scientist" not "Engineer", "Frontend Developer" not "Developer"
- Do NOT include seniority (junior/senior) unless it's the only distinguishing factor
- Respond with ONLY the role title, no explanation, no punctuation at the end

CV:
{cv_text}"""


def detect_role_from_cv(cv_text: str) -> str | None:
    """Return detected role title string, or None if detection fails."""
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    # Use first 2000 chars — header + summary is enough to detect role
    snippet = cv_text[:2000].strip()

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": _PROMPT.format(cv_text=snippet)}],
                    "max_tokens": 20,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            role = resp.json()["choices"][0]["message"]["content"].strip()

            # Sanitize: strip quotes, punctuation, newlines
            role = re.sub(r'^["\']|["\']$', "", role).strip(" .,\n")

            # Reject if too long (LLM hallucinated a sentence) or empty
            if not role or len(role.split()) > 6:
                logger.warning("role_detection_suspicious", raw=role[:80])
                return None

            logger.info("role_detected", role=role)
            return role

    except Exception as e:
        logger.error("role_detection_failed", error=str(e))
        return None

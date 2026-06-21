"""Detect AI role archetype from CV text using LLM.

Archetypes represent distinct AI practitioner profiles. Only fires when the
detected role is AI/ML-adjacent; returns None for non-AI CVs.
"""

import json
import re

import httpx

from app.core.logging import structured_logger as logger

_AI_ROLE_KEYWORDS = frozenset([
    "ai", "ml", "machine learning", "deep learning", "llm", "nlp",
    "data scientist", "ai engineer", "ml engineer", "mlops", "llmops",
    "agentic", "generative ai", "computer vision", "applied ml", "applied ai",
    "large language model", "transformer", "neural network",
])

_ARCHETYPE_DESCRIPTIONS = {
    "ai_platform_llmops": (
        "Builds/maintains AI infrastructure: model serving, MLOps pipelines, "
        "vector databases, LLMOps tooling, experiment tracking, feature stores."
    ),
    "agentic_automation": (
        "Designs AI agent systems: multi-agent orchestration, autonomous workflows, "
        "tool-calling pipelines, LLM-powered automation."
    ),
    "technical_ai_pm": (
        "Bridges AI research and product: AI product specs, model trade-off evaluation, "
        "coordinates researchers and engineers, drives AI roadmaps."
    ),
    "solutions_architect": (
        "End-to-end AI solutions for enterprise clients: architecture design, "
        "POC leadership, AI adoption advisory and integration patterns."
    ),
    "forward_deployed": (
        "Customer-facing AI implementation: client site deployments, demos, "
        "integration engineering, translating requirements into technical specs."
    ),
    "transformation": (
        "Organizational AI adoption: AI literacy programs, strategy frameworks, "
        "executive alignment, change management for AI initiatives."
    ),
}

_PROMPT = """\
Read the CV below and identify the PRIMARY AI practitioner archetype.

Choose ONE:
- ai_platform_llmops: Infrastructure, MLOps, model serving, vector DB, experiment tracking
- agentic_automation: AI agents, multi-agent systems, LLM orchestration, workflow automation
- technical_ai_pm: AI product management, model evaluation, AI roadmap, PM + technical bridge
- solutions_architect: Enterprise AI architecture, client solutions, AI consulting, POCs
- forward_deployed: Customer-facing AI implementation, demos, client integration
- transformation: Organizational AI adoption, AI strategy, change management
- none: CV is not AI/ML-focused

Return ONLY JSON: {{"archetype": "<choice>", "confidence": "<high|medium|low>", "reasoning": "<1-2 sentences>"}}

CV (first 3000 chars):
{cv_text}"""


def _is_ai_role(detected_role: str | None, cv_text: str) -> bool:
    if detected_role:
        r = detected_role.lower()
        if any(kw in r for kw in _AI_ROLE_KEYWORDS):
            return True
    snippet = cv_text[:1000].lower()
    return sum(1 for kw in _AI_ROLE_KEYWORDS if kw in snippet) >= 2


def detect_archetype(cv_text: str, detected_role: str | None = None) -> dict | None:
    """Detect AI role archetype. Returns dict or None if not AI-related or on failure."""
    if not _is_ai_role(detected_role, cv_text):
        return None

    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    prompt = _PROMPT.format(cv_text=cv_text[:3000].strip())

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"].strip()

        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            logger.warning("archetype_no_json", raw=raw[:200])
            return None

        data = json.loads(match.group())
        archetype = data.get("archetype", "none")
        if archetype == "none":
            return None

        result = {
            "type": archetype,
            "confidence": data.get("confidence", "medium"),
            "reasoning": data.get("reasoning", ""),
            "description": _ARCHETYPE_DESCRIPTIONS.get(archetype, ""),
        }
        logger.info("archetype_detected", archetype=archetype, role=detected_role)
        return result

    except Exception as e:
        logger.warning("archetype_detection_failed", error=str(e))
        return None

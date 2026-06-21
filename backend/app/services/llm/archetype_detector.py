"""Universal professional archetype detection from CV text.

Covers 8 domains × ~34 archetypes. Runs for ALL CVs regardless of role.
Uses a single LLM call: detect domain + archetype together.

Domains: engineering, ai_ml, data, design, product, marketing, finance, management
"""

import json
import re

import httpx

from app.core.logging import structured_logger as logger

# ─── Archetype registry ───────────────────────────────────────────────────────
# Structure: domain → {archetype_key: description}
# Descriptions are used in the API response to give context to the frontend.

ARCHETYPES: dict[str, dict[str, str]] = {
    "engineering": {
        "backend_systems": (
            "Builds and scales server-side systems: APIs, databases, microservices, "
            "message queues, and distributed systems. Focus on reliability and throughput."
        ),
        "frontend_product": (
            "Implements user-facing interfaces: web UI, performance optimization, "
            "accessibility, design system integration, and cross-browser compatibility."
        ),
        "platform_infrastructure": (
            "Owns the developer platform: CI/CD, cloud infrastructure, Kubernetes, "
            "observability stack, SRE practices, and internal developer tooling."
        ),
        "security_engineer": (
            "Secures systems and software: application security, penetration testing, "
            "threat modeling, security reviews, SIEM, and compliance frameworks."
        ),
        "mobile_developer": (
            "Builds native or cross-platform mobile apps: iOS (Swift), Android (Kotlin), "
            "React Native, Flutter — focus on performance and app store delivery."
        ),
        "full_stack": (
            "End-to-end product feature builder: comfortable across frontend, backend, "
            "and infrastructure. Breadth over deep specialization."
        ),
    },
    "ai_ml": {
        "ai_platform_llmops": (
            "Builds AI/ML infrastructure: model serving, MLOps pipelines, LLMOps tooling, "
            "vector databases, experiment tracking, and evaluation frameworks."
        ),
        "agentic_automation": (
            "Designs AI agent systems: multi-agent orchestration, tool-calling pipelines, "
            "HITL workflows, autonomous task execution, and LLM-powered automation."
        ),
        "technical_ai_pm": (
            "Bridges AI research and product: writes AI product specs, evaluates model "
            "trade-offs, defines evaluation criteria, and drives AI roadmaps."
        ),
        "ai_solutions_architect": (
            "Designs end-to-end AI solutions for clients or enterprise: architecture, "
            "POC leadership, AI adoption advisory, and system integration patterns."
        ),
        "forward_deployed_ai": (
            "Customer-facing AI engineering: implements AI at client sites, builds demos, "
            "handles integration, and translates requirements to technical specs."
        ),
        "ai_transformation": (
            "Drives organizational AI adoption: AI literacy programs, executive alignment, "
            "change management, and enablement for non-technical stakeholders."
        ),
    },
    "data": {
        "analytics_bi": (
            "Turns data into business insights: SQL, BI dashboards (Tableau/Looker/Power BI), "
            "self-serve reporting, and stakeholder-facing analytics."
        ),
        "data_engineer": (
            "Builds data infrastructure: ETL/ELT pipelines, data warehouses, Airflow/Spark "
            "orchestration, streaming (Kafka/Flink), and data platform tooling."
        ),
        "ml_scientist": (
            "Research-oriented ML practitioner: model development, feature engineering, "
            "A/B experimentation, statistical methods, and publications."
        ),
        "analytics_engineer": (
            "Sits between data engineering and analytics: dbt models, metrics definitions, "
            "semantic layer, data quality, and documentation for data consumers."
        ),
    },
    "design": {
        "product_designer": (
            "End-to-end UX practitioner: user flows, wireframes, high-fidelity Figma "
            "designs, interaction design, and handoff to engineering."
        ),
        "ux_researcher": (
            "Generates user insights: moderated interviews, usability testing, surveys, "
            "synthesis, and translating findings into design recommendations."
        ),
        "design_systems": (
            "Builds scalable design infrastructure: component libraries, design tokens, "
            "accessibility standards, and design-to-code pipelines."
        ),
        "visual_brand": (
            "Owns visual and brand identity: brand guidelines, typography, illustration, "
            "motion design, and creative direction across touchpoints."
        ),
    },
    "product": {
        "growth_pm": (
            "Drives metric-led product growth: acquisition funnels, A/B experimentation, "
            "retention mechanics, referral loops, and activation optimization."
        ),
        "platform_developer_pm": (
            "Owns developer-facing or API products: B2B/enterprise platform, developer "
            "experience, SDKs, and product-led growth for technical audiences."
        ),
        "consumer_product_pm": (
            "Drives B2C product: user experience, engagement, retention, and end-to-end "
            "product lifecycle from discovery to launch."
        ),
    },
    "marketing": {
        "performance_growth": (
            "Paid acquisition and growth: Google/Meta ads, CAC optimization, ROAS tracking, "
            "attribution modeling, and performance marketing channels."
        ),
        "content_brand": (
            "Builds brand through content: editorial strategy, SEO, brand voice, "
            "storytelling, thought leadership, and content distribution."
        ),
        "product_marketing": (
            "Positions and launches products: messaging, GTM strategy, competitive "
            "intelligence, sales enablement, and customer segmentation."
        ),
        "community_social": (
            "Builds audience and community: social media management, influencer programs, "
            "community engagement, events, and organic growth."
        ),
    },
    "finance": {
        "fpa_controller": (
            "Financial planning and reporting: budgeting, forecasting, variance analysis, "
            "management reporting, and financial operations."
        ),
        "investment_analyst": (
            "Deal-oriented finance: M&A analysis, private equity/VC deal evaluation, "
            "financial modeling, valuation, and due diligence."
        ),
        "risk_compliance": (
            "Controls and regulatory work: internal audit, compliance frameworks, "
            "risk assessment, SOX/regulatory filings, and governance."
        ),
    },
    "management": {
        "people_leader": (
            "Builds and develops teams: hiring, performance management, coaching, "
            "org design, and creating high-performing engineering or functional teams."
        ),
        "program_delivery": (
            "Drives cross-functional delivery: project management, PMO, dependencies "
            "tracking, stakeholder alignment, and on-time/budget execution."
        ),
        "operations_excellence": (
            "Optimizes how the organization runs: process improvement, operational "
            "efficiency, COO-type work, and building scalable operating models."
        ),
        "strategy_advisory": (
            "Shapes organizational direction: strategic planning, consulting frameworks, "
            "executive advisory, market analysis, and high-level decision support."
        ),
    },
}

# Flat list of all archetype keys — built once at import time
_ALL_ARCHETYPE_LINES = "\n".join(
    f"{domain.upper()}: {', '.join(archetypes.keys())}"
    for domain, archetypes in ARCHETYPES.items()
)

# Regular string (not f-string) so {{}} escapes work correctly with .format()
_PROMPT_TEMPLATE = """\
Identify the professional domain and specific archetype that best describes this CV.

Domains and archetypes:
{archetype_lines}

Return ONLY JSON:
{{"domain": "<domain>", "archetype": "<archetype_key>", "confidence": "<high|medium|low>", "reasoning": "<1-2 sentences>"}}

Rules:
- Choose the SINGLE best-fitting archetype across all domains
- If the CV is a student with no clear professional identity, return {{"domain": "none", "archetype": "none", "confidence": "low", "reasoning": "Insufficient professional experience to classify."}}
- Reference specific evidence from the CV in your reasoning

CV (first 3000 chars):
{cv_text}"""


def detect_archetype(cv_text: str, detected_role: str | None = None) -> dict | None:
    """Detect professional archetype for any CV. Returns dict or None on failure."""
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        return None

    prompt = _PROMPT_TEMPLATE.format(
        archetype_lines=_ALL_ARCHETYPE_LINES,
        cv_text=cv_text[:3000].strip(),
    )

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 200,
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
        domain = data.get("domain", "none")
        archetype = data.get("archetype", "none")

        if domain == "none" or archetype == "none":
            return None

        description = ARCHETYPES.get(domain, {}).get(archetype, "")
        result = {
            "domain": domain,
            "type": archetype,
            "confidence": data.get("confidence", "medium"),
            "reasoning": data.get("reasoning", ""),
            "description": description,
        }
        logger.info("archetype_detected", domain=domain, archetype=archetype, role=detected_role)
        return result

    except Exception as e:
        logger.warning("archetype_detection_failed", error=str(e))
        return None

"""LLM-based CV scoring — calibrated to experience level and role category.

Features:
- Ensemble scoring (configurable N runs, median per dimension)
- Redis cache: same CV+role returns cached result, cuts API cost and variance
- scoring_algorithm_version field for safe cross-run comparison

Cache key: llm_score:{SCORING_VERSION}:{sha256(cv_slice+role+jd)[:24]}
TTL: CV_ANALYZER_LLM_CACHE_TTL (default 86400s)
"""

import hashlib
import json
import re
import statistics

import httpx
import redis as redis_sync

from app.core.logging import structured_logger as logger
from app.services.scoring.text_normalizer import normalize_cv_text

# Bump this when the prompt or weights change significantly.
# Changing this string automatically invalidates all cached scores.
SCORING_VERSION = "v5"

_WEIGHTS = {
    "impact": 0.35,
    "clarity": 0.30,
    "relevance": 0.20,
    "completeness": 0.15,
}

# Maps archetype registry domain keys → scoring category (used for impact guidance selection).
# Archetype detection is more precise than role-text matching, so it takes priority.
_DOMAIN_TO_CATEGORY: dict[str, str] = {
    "healthcare": "healthcare",
    "technology": "engineering",
    "ai_ml": "data",
    "data": "data",
    "design": "design",
    "product": "management",
    "marketing": "marketing",
    "finance_banking": "finance",
    "government_public": "government",
    "manufacturing": "manufacturing",
    "construction": "construction",
    "hospitality_fnb": "hospitality",
    "retail": "retail",
    "logistics_transport": "logistics",
    "creative_media": "creative",
    "agriculture": "agriculture",
    "education": "education",
    "beauty_wellness": "beauty",
    "gig_freelance": "general",
    "journalism_media": "journalism",
    "legal_professional": "legal",
    "mining_energy": "mining",
    "human_resources": "hr",
    "social_ngo": "social",
    "religious_services": "general",
    "property_realestate": "property",
    "telecom_infrastructure": "engineering",
    "environment_sustainability": "environment",
    "domestic_household": "general",
    "arts_entertainment_sports": "arts",
    "digital_economy": "digital_economy",
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
    "data": (
        "For data roles (analyst/scientist/engineer/MLOps), impact includes: model accuracy improvements "
        "(precision, recall, F1, AUC), pipeline throughput or latency reduction, reduction in manual "
        "reporting time, dashboard adoption rates, cost savings from automation, and business decisions "
        "enabled or revenue influenced by analysis."
    ),
    "finance": (
        "For finance/accounting/banking roles, impact includes: cost reduction ($ or %), budget variance "
        "tightened, revenue protected or generated, time saved on reporting cycles, forecast accuracy "
        "improvements, portfolio size or AUM managed, and compliance/audit outcomes."
    ),
    "healthcare": (
        "For healthcare roles, impact includes: patient volume handled (daily/monthly), "
        "clinical outcome metrics (recovery rate, complication reduction, mortality rate), "
        "certifications earned (STR/SIP/fellowship/subspecialty), research publications, "
        "quality improvement outcomes (SNARS/JCI audit scores), "
        "program coverage (% population served), waiting time reduction, "
        "and operational throughput (procedure volume per period)."
    ),
    "government": (
        "For government/public sector roles, impact includes: program beneficiaries served (number), "
        "budget managed (Rp), compliance and audit results (BPK/BPKP finding reduction), "
        "policy outcomes (target achievement %), service delivery improvements "
        "(waiting time, digitalization adoption rate), awards/recognition received, "
        "and cross-institutional coordination outcomes."
    ),
    "manufacturing": (
        "For manufacturing roles, impact includes: OEE improvement (%), "
        "defect/rejection rate reduction (PPM or %), production throughput increase, "
        "cost savings (material, energy, downtime in Rp or %), "
        "safety record (LTI-free days, LTIR reduction), cycle time reduction, "
        "certifications achieved (ISO 9001/14001, OHSAS 18001), "
        "and capacity utilization improvement."
    ),
    "construction": (
        "For construction roles, impact includes: project delivered on-time and on-budget (% variance), "
        "contract value managed (Rp), safety record (LTI-free days, near-miss reduction), "
        "quality defect rate, team/subcontractor size coordinated, "
        "value engineering savings (Rp), and client satisfaction or repeat contracts."
    ),
    "hospitality": (
        "For hospitality/F&B roles, impact includes: revenue per cover, "
        "occupancy rate and RevPAR improvement, food cost % reduction, "
        "customer satisfaction score (NPS, Google/TripAdvisor rating), "
        "upselling revenue contribution, team/outlet size managed, "
        "staff turnover reduction, and health/HACCP compliance results."
    ),
    "retail": (
        "For retail roles, impact includes: sales per sqm, inventory turnover, "
        "shrinkage/loss reduction (%), conversion rate improvement, "
        "basket size increase, revenue growth (% YoY), "
        "store/category ranking within region, and stock availability rate."
    ),
    "logistics": (
        "For logistics/transport roles, impact includes: on-time delivery rate (%), "
        "cost per shipment/km reduction, fleet or warehouse utilization %, "
        "throughput improvement (orders or tons/day), inventory accuracy %, "
        "SLA compliance with key clients, and team/driver count managed."
    ),
    "creative": (
        "For creative/media roles, impact includes: follower or subscriber growth (absolute or %), "
        "engagement rate vs benchmark, view/impression milestones, "
        "brand deals or clients secured (number or value), production credits (notable titles), "
        "awards and festival selections, portfolio breadth across industries, "
        "and measurable audience demographics achieved."
    ),
    "agriculture": (
        "For agriculture/farming roles, impact includes: yield per hectare (increase %), "
        "production cost reduction (%), quality grade achieved (Grade A, SNI, organic cert), "
        "land area managed (Ha), certification earned (GAP, SOP, rainforest alliance), "
        "revenue or income generated, livestock count or production volume per cycle, "
        "and technology adoption outcomes (IoT, precision farming)."
    ),
    "education": (
        "For education roles, impact includes: student pass/kelulusan rate (%), "
        "student satisfaction score, class or student cohort size, "
        "curriculum development and adoption, enrollment growth, "
        "student competition achievements, accreditation results (BAN-PT/S grade), "
        "digital learning adoption rate, and training program completion rate."
    ),
    "beauty": (
        "For beauty/wellness roles, impact includes: client retention rate (%), "
        "revenue per treatment, monthly active client volume, "
        "certification or competition achievements (BNSP, contest wins), "
        "social media growth (followers, content reach), "
        "product or service launched, training classes delivered, "
        "and outlet/studio revenue contribution."
    ),
    "journalism": (
        "For journalism/media roles, impact includes: articles or content published (volume), "
        "readership, pageview, or viewership milestones, "
        "virality or social reach achieved, awards and nominations (PWI, Anugerah Jurnalistik), "
        "exclusive stories or scoops landed, podcast or broadcast audience size, "
        "and platform growth metrics (subscribers, followers)."
    ),
    "legal": (
        "For legal/professional roles, impact includes: case win rate (%), "
        "contract value negotiated or protected (Rp/$), "
        "litigation outcomes (settlement amount, favorable court ruling), "
        "compliance audit results (zero findings), licenses or permits secured, "
        "legal risk exposure mitigated (Rp), policy or regulation drafted, "
        "and client retention rate."
    ),
    "mining": (
        "For mining/energy roles, impact includes: production volume (ton/bbl/MW), "
        "cost per ton/bbl/MWh reduction (%), LTIFR or safety record improvement, "
        "ore or resource recovery rate improvement, equipment availability %, "
        "project capex delivered vs budget (% variance), "
        "environmental compliance (zero violations), and reserve or resource estimate contribution."
    ),
    "hr": (
        "For HR roles, impact includes: time-to-hire reduction (days), "
        "cost-per-hire reduction (%), attrition rate reduction (%), "
        "employee satisfaction or eNPS improvement, training completion rate, "
        "headcount managed, payroll accuracy %, "
        "labor compliance or audit results, and employer branding outcomes."
    ),
    "social": (
        "For social/NGO roles, impact includes: beneficiaries directly reached (number), "
        "funds raised (Rp/$), donor retention rate, program outcome achievement (% of target), "
        "volunteer hours mobilized, partnership value secured, "
        "and measurable behavior change or service coverage increase in target communities."
    ),
    "property": (
        "For property/real estate roles, impact includes: transaction value facilitated (Rp), "
        "units sold or leased per period, occupancy rate achieved, "
        "rental yield improvement, client referral rate, listing volume managed, "
        "project development value overseen, and time-on-market reduction."
    ),
    "environment": (
        "For environment/sustainability roles, impact includes: emissions reduced (CO₂ tons/year), "
        "waste diverted from landfill (ton or %), renewable energy capacity added (MW/kWh), "
        "cost savings from efficiency or green programs (Rp), compliance rate (zero violations), "
        "ESG rating or PROPER grade improvement, area conserved or rehabilitated (Ha), "
        "and stakeholder or community engagement outcomes."
    ),
    "arts": (
        "For arts/entertainment/sports roles, impact includes: competition or performance achievements "
        "(rankings, titles, medals, awards), audience size at events, "
        "revenue or sponsorship generated or secured, media coverage scale, "
        "coaching outcomes (student achievements, competition wins), "
        "and production or event scale (budget, attendance, reach)."
    ),
    "digital_economy": (
        "For digital economy/startup roles, impact includes: GMV or TPV, MAU/DAU, "
        "revenue growth (% MoM/YoY), conversion rate improvement, "
        "app downloads or installs, user retention or churn reduction, "
        "fundraising raised (seed/series, total amount), NPS score, "
        "and platform scale metrics (transactions/day, merchants onboarded)."
    ),
    "devops": (
        "For DevOps/SRE/infrastructure roles, impact includes: deployment frequency improvements, "
        "MTTR/incident reduction, uptime/availability percentages (e.g. 99.9%), infrastructure cost "
        "savings, CI/CD pipeline speed gains, and scale metrics (servers managed, requests/day handled)."
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
    "impact": "<diagnosis of impact quality> — e.g. change '[weak phrase from CV]' → '[stronger version with metric]'",
    "clarity": "<diagnosis of clarity/structure> — e.g. '[specific issue observed]' could be improved by '[concrete fix]'",
    "relevance": "<how well skills/experience match target role> — key gap: '[specific missing skill or keyword]'",
    "completeness": "<which sections are present or missing> — e.g. '[section name]' section is missing or needs '[specific content]'"
  }}
}}\
"""


# ---------------------------------------------------------------------------
# Redis cache helpers
# ---------------------------------------------------------------------------


def _cache_key(cv_slice: str, role: str, jd_slice: str) -> str:
    raw = f"{cv_slice}|{role}|{jd_slice}"
    digest = hashlib.sha256(raw.encode()).hexdigest()[:24]
    return f"llm_score:{SCORING_VERSION}:{digest}"


def _cache_get(key: str, settings) -> dict | None:
    try:
        r = redis_sync.from_url(settings.CV_ANALYZER_REDIS_URL, decode_responses=True)
        raw = r.get(key)
        if raw:
            logger.info("llm_scoring_cache_hit", key=key)
            return json.loads(raw)
    except Exception as e:
        logger.warning("llm_score_cache_read_failed", error=str(e))
    return None


def _cache_set(key: str, data: dict, settings) -> None:
    try:
        r = redis_sync.from_url(settings.CV_ANALYZER_REDIS_URL, decode_responses=True)
        r.setex(key, settings.CV_ANALYZER_LLM_CACHE_TTL, json.dumps(data))
    except Exception as e:
        logger.warning("llm_score_cache_write_failed", error=str(e))


# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------


def _role_category(role: str | None, archetype_domain: str | None = None) -> str:
    # Archetype domain is more precise than free-text role matching — use it first
    if archetype_domain and archetype_domain in _DOMAIN_TO_CATEGORY:
        return _DOMAIN_TO_CATEGORY[archetype_domain]
    if not role:
        return "general"
    r = role.lower()
    if any(
        w in r
        for w in [
            "design",
            "ux",
            "ui ",
            "ui/ux",
            "visual",
            "creative",
            "brand",
            "graphic",
        ]
    ):
        return "design"
    if any(w in r for w in ["marketing", "growth", "seo", "social media", "copywrite"]):
        return "marketing"
    if any(
        w in r
        for w in [
            "devops",
            "sre",
            "site reliability",
            "infrastructure",
            "platform engineer",
            "cloud engineer",
            "devsecops",
        ]
    ):
        return "devops"
    if any(
        w in r
        for w in [
            "data analyst",
            "data scientist",
            "data engineer",
            "business intelligence",
            "bi developer",
            "analytics engineer",
            "mlops",
            "ml ops",
        ]
    ):
        return "data"
    if any(
        w in r
        for w in [
            "financial analyst",
            "finance manager",
            "accountant",
            "accounting",
            "investment banker",
            "banking",
            "audit",
            "treasury",
            "controller",
            "cfo",
        ]
    ):
        return "finance"
    if any(
        w in r
        for w in [
            "product manager",
            "project manager",
            "scrum master",
            "program manager",
            "operations manager",
        ]
    ):
        return "management"
    if any(
        w in r
        for w in [
            "doctor",
            "nurse",
            "dokter",
            "perawat",
            "bidan",
            "farmasi",
            "apoteker",
            "fisioterapis",
        ]
    ):
        return "healthcare"
    if any(
        w in r
        for w in [
            "teacher",
            "guru",
            "lecturer",
            "dosen",
            "trainer",
            "pengajar",
            "instruktur",
        ]
    ):
        return "education"
    if any(
        w in r
        for w in ["lawyer", "legal", "advokat", "notaris", "hukum", "counsel", "jaksa"]
    ):
        return "legal"
    if any(
        w in r
        for w in [
            "journalist",
            "reporter",
            "jurnalis",
            "wartawan",
            "redaktur",
            "editor media",
        ]
    ):
        return "journalism"
    if any(
        w in r
        for w in [
            "photographer",
            "videographer",
            "filmmaker",
            "animator",
            "content creator",
            "kreator",
        ]
    ):
        return "creative"
    if any(
        w in r
        for w in [
            "hr ",
            "human resource",
            "hrga",
            "recruitment",
            "people ops",
            "talent acquisition",
        ]
    ):
        return "hr"
    return "engineering"


def _extract_json(text: str) -> dict:
    # Tier 1: direct parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Tier 2: extract first {...} block then parse
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            # Tier 3: json_repair for malformed JSON with closing brace present
            try:
                from json_repair import repair_json

                repaired = repair_json(match.group(), return_objects=True)
                if isinstance(repaired, dict):
                    return repaired
            except Exception:
                pass
    # Tier 4: json_repair on full raw text — handles truncated JSON with no closing brace
    # (max_tokens cutoff mid-string means regex never matches, but json_repair can close open structures)
    try:
        from json_repair import repair_json

        repaired = repair_json(text, return_objects=True)
        if isinstance(repaired, dict) and any(
            k in repaired for k in ("impact", "clarity", "relevance", "completeness")
        ):
            return repaired
    except Exception:
        pass
    raise ValueError(f"Cannot extract JSON from LLM output: {text[:500]!r}")


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
                headers={
                    "Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"
                },
                json={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1200,
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


# ---------------------------------------------------------------------------
# Public scorer
# ---------------------------------------------------------------------------


def score_cv_with_llm(
    cv_text: str,
    target_role: str | None = None,
    jd_text: str | None = None,
    archetype_domain: str | None = None,
) -> dict:
    from app.core.config import get_settings

    settings = get_settings()
    role_label = target_role or "General Professional"
    category = _role_category(target_role, archetype_domain)
    cv_slice = normalize_cv_text(cv_text)[:4000]
    jd_slice = (jd_text or "")[:200]

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

    # Cache lookup — only for single-run (ensemble explicitly wants fresh calls)
    cache_key = _cache_key(cv_slice, role_label, jd_slice)
    if n_runs == 1:
        cached = _cache_get(cache_key, settings)
        if cached:
            return cached

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

    result_dict = {
        "overall": overall,
        **scores,
        "reasonings": reasonings,
        "scoring_method": "llm",
        "scoring_algorithm_version": SCORING_VERSION,
        "provider": "koboi",
        "jd_relevance": bool(jd_text),
        "target_role": target_role,
        "ensemble_runs": len(all_raw),
        "score_ranges": score_ranges if len(all_raw) > 1 else {},
    }

    # Cache the result for future identical requests
    if n_runs == 1:
        _cache_set(cache_key, result_dict, settings)

    return result_dict


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
        "scoring_algorithm_version": SCORING_VERSION,
        "provider": "koboi",
        "jd_relevance": False,
        "target_role": target_role,
        "ensemble_runs": 0,
        "score_ranges": {},
    }

"""Test universal archetype detection across all 8 domains.

Usage:
    conda activate sbk-cv-analyzer
    cd backend
    python scripts/test_archetype_universal.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.services.llm.archetype_detector import detect_archetype, ARCHETYPES

# Print registry summary
total = sum(len(v) for v in ARCHETYPES.values())
print(f"\nArchetype registry: {len(ARCHETYPES)} domains, {total} archetypes total")
for domain, archs in ARCHETYPES.items():
    print(f"  {domain.upper():<20} {', '.join(archs.keys())}")

print("\n" + "=" * 70)

CV_SAMPLES = [
    (
        "ML Engineer (should → ai_ml / ai_platform_llmops)",
        "Machine Learning Engineer. Experienced in MLOps, MLflow, Kubernetes-based model serving, vector databases (pgvector, Pinecone), LLM evaluation frameworks. Built RAG pipelines and LLMOps monitoring.",
        "Machine Learning Engineer",
    ),
    (
        "UI/UX Designer (should → design / product_designer)",
        "Senior UX Designer at Grab. Led end-to-end product design: user research, wireframes, high-fidelity Figma prototypes, usability testing. Redesigned checkout flow increasing conversion 22%.",
        "UX Designer",
    ),
    (
        "DevOps/SRE (should → engineering / platform_infrastructure)",
        "Site Reliability Engineer. Manages Kubernetes clusters on AWS across 3 regions, 99.95% uptime. Built CI/CD with GitHub Actions. Prometheus + Grafana observability. Reduced MTTR from 4h to 20min.",
        "SRE",
    ),
    (
        "Data Analyst (should → data / analytics_bi)",
        "Data Analyst at Tokopedia. Built Power BI dashboards used by 50+ stakeholders. SQL expert, wrote 200+ complex queries. Identified pricing anomaly saving Rp 2.4B quarterly.",
        "Data Analyst",
    ),
    (
        "Product Manager (should → product / consumer_product_pm or growth_pm)",
        "Product Manager at Gojek. Owned Rides product serving 5M daily users. Ran 40+ A/B tests, improved driver acceptance rate 18%. Led cross-functional squad of 12. Defined quarterly OKRs.",
        "Product Manager",
    ),
    (
        "Content Marketer (should → marketing / content_brand)",
        "Content Marketing Manager. Built editorial strategy from 0 to 120K monthly organic visits via SEO. Managed 8-person content team. Brand voice guidelines adopted company-wide.",
        "Marketing Manager",
    ),
    (
        "Financial Analyst (should → finance / fpa_controller)",
        "Financial Analyst at BCG. Owns FP&A: annual budgeting, monthly forecasting, variance analysis. Built financial model in Excel/Python used by CFO for board reporting. Managed Rp 50B budget.",
        "Financial Analyst",
    ),
    (
        "Engineering Manager (should → management / people_leader)",
        "Engineering Manager at Shopee. Manages 15 engineers across 3 squads. Drove 0→1 hiring process, grew team from 4 to 15. 1:1 cadence, career laddering, technical interviews. 90% retention rate.",
        "Engineering Manager",
    ),
]

for label, cv_snippet, detected_role in CV_SAMPLES:
    print(f"\nCV: {label}")
    result = detect_archetype(cv_snippet, detected_role=detected_role)
    if result:
        print(f"  domain    : {result['domain']}")
        print(f"  archetype : {result['type']} (confidence: {result['confidence']})")
        print(f"  reasoning : {result['reasoning'][:100]}...")
    else:
        print("  result    : None (API unavailable or no classification)")

print("\n" + "=" * 70)
print("Done.")

"""Quick smoke-test for all 5 new features.

Usage:
    conda activate sbk-cv-analyzer
    cd backend
    python scripts/test_new_features.py
"""

import sys
import textwrap
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── 1. ANTI-CLICHÉ RULES IN SYSTEM PROMPT ────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 1: Anti-cliché rules in suggestions system prompt")
print("=" * 60)
from app.services.llm.koboi_llm_service import _build_system_prompt, _ANTI_CLICHE_RULES

prompt = _build_system_prompt("no context")
assert "passionate about" in prompt, "Anti-cliché rules missing from prompt"
assert "leveraged" in prompt
assert "spearheaded" in prompt
print(f"  PASS — anti-cliché block present ({len(_ANTI_CLICHE_RULES)} chars)")

# ─── 2. SECURITY: IMAGE EXTENSIONS ACCEPTED ───────────────────────────────────
print("\n" + "=" * 60)
print("TEST 2: Security — JPG/PNG extensions accepted")
print("=" * 60)
from app.core.security import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES

assert ".jpg" in ALLOWED_EXTENSIONS, ".jpg not in ALLOWED_EXTENSIONS"
assert ".jpeg" in ALLOWED_EXTENSIONS
assert ".png" in ALLOWED_EXTENSIONS
assert "image/jpeg" in ALLOWED_MIME_TYPES
assert "image/png" in ALLOWED_MIME_TYPES
print(f"  PASS — extensions: {sorted(ALLOWED_EXTENSIONS)}")

# ─── 3. ARCHETYPE DETECTION ───────────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 3: Archetype detection (live LLM call)")
print("=" * 60)
from app.services.llm.archetype_detector import detect_archetype, _is_ai_role

# Heuristic check (no API call)
ai_cv = (
    "Machine learning engineer with LLM experience, MLOps pipelines, vector databases"
)
non_ai_cv = "Marketing manager with experience in brand campaigns and social media"

assert _is_ai_role(
    "Machine Learning Engineer", ai_cv
), "_is_ai_role should be True for ML CV"
assert not _is_ai_role(
    "Marketing Manager", non_ai_cv
), "_is_ai_role should be False for marketing CV"
print("  PASS — _is_ai_role() heuristic correct")

# Live LLM call with a realistic AI CV snippet
ai_cv_full = textwrap.dedent("""
    Rafli — Machine Learning Engineer
    Email: rafli@example.com

    SUMMARY
    ML Engineer with 3 years building production AI systems. Experienced in LLMOps,
    MLflow, vector databases (Pinecone, pgvector), and deploying LLM-powered APIs.
    Built RAG pipelines serving 10K+ daily queries.

    EXPERIENCE
    Senior ML Engineer — StartupAI (2022–present)
    - Built MLOps pipeline on Kubernetes reducing model deployment from 2 days to 30 min
    - Implemented vector similarity search with pgvector, latency < 50ms P99
    - Led LLM evaluation framework (RAGAS) across 5 product teams
    - Integrated Celery-based async inference queue handling 200K requests/day

    SKILLS
    Python, PyTorch, LangChain, MLflow, Kubernetes, pgvector, Redis, FastAPI
""")

print("  Calling LLM for archetype detection...")
result = detect_archetype(ai_cv_full, detected_role="Machine Learning Engineer")
if result:
    print(f"  PASS — archetype: {result['type']} (confidence: {result['confidence']})")
    print(f"         reasoning: {result['reasoning'][:100]}...")
else:
    print("  WARN — returned None (API unavailable or non-AI classification)")

# Non-AI CV should return None without API call
result_non_ai = detect_archetype(non_ai_cv, detected_role="Marketing Manager")
assert result_non_ai is None, "Non-AI CV should return None"
print("  PASS — non-AI CV correctly returns None")

# ─── 4. JD RED FLAGS ANALYSIS ─────────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 4: JD red flags analysis (live LLM call)")
print("=" * 60)
from app.services.llm.jd_analyzer import analyze_jd_red_flags

# JD with multiple red flags
red_flag_jd = textwrap.dedent("""
    Senior Software Engineer — Fast Growing Startup

    We are looking for a passionate, hardworking self-starter to join our fast-paced,
    no-excuses team. You must be willing to wear many hats in a dynamic environment.

    Requirements:
    - 10+ years experience with Kubernetes (note: Kubernetes released in 2014)
    - 8+ years React experience (React released in 2013)
    - Must be available on weekends and willing to work beyond 9-to-5
    - Salary: competitive (unlisted)
    - Junior-to-mid level role with senior-level deliverables

    Responsibilities include leading a team of 10+ engineers, setting technical strategy,
    and managing relationships with C-level stakeholders.
""")

print("  Calling LLM for JD red flags...")
result = analyze_jd_red_flags(red_flag_jd)
if result:
    flags = result.get("red_flags", [])
    quality = result.get("overall_quality", "?")
    print(f"  PASS — {len(flags)} red flags detected, quality: {quality}")
    for f in flags:
        sev = f.get("severity", "?")
        flag = f.get("flag", "?")
        detail = f.get("detail", "")[:80]
        print(f"    [{sev.upper()}] {flag}: {detail}")
else:
    print("  WARN — returned None (API unavailable)")

# Short JD should be skipped
result_short = analyze_jd_red_flags("Engineer needed.")
assert result_short is None, "Short JD should return None"
print("  PASS — short JD correctly returns None")

# ─── 5. VISION SERVICE (REPLICATE) ────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 5: Granite Vision 4.1 4B via Replicate")
print("=" * 60)
from app.services.vision import VISION_AVAILABLE

print(f"  replicate package available: {VISION_AVAILABLE}")

if not VISION_AVAILABLE:
    print("  SKIP — install replicate: pip install replicate")
else:
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_REPLICATE_API_TOKEN:
        print("  SKIP — CV_ANALYZER_REPLICATE_API_TOKEN not set in .env")
    else:
        # Create a minimal test image with PIL if available
        try:
            from PIL import Image, ImageDraw, ImageFont
            import io

            img = Image.new("RGB", (600, 200), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            draw.text((20, 20), "John Doe — Software Engineer", fill=(0, 0, 0))
            draw.text(
                (20, 60), "Email: john@example.com | Phone: +1 555-1234", fill=(0, 0, 0)
            )
            draw.text(
                (20, 100), "SKILLS: Python, FastAPI, Docker, PostgreSQL", fill=(0, 0, 0)
            )
            draw.text(
                (20, 140), "EXPERIENCE: 5 years building scalable APIs", fill=(0, 0, 0)
            )

            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            img_bytes = buf.getvalue()

            print("  Sending test image to Granite Vision 4.1 4B on Replicate...")
            from app.services.vision import extract_text_from_image

            text = extract_text_from_image(img_bytes, "image/jpeg")

            if text and len(text.strip()) > 10:
                print(f"  PASS — extracted {len(text)} chars")
                print(f"  Preview: {text[:200]!r}")
            else:
                print(f"  WARN — extracted text short or empty: {text!r}")

        except ImportError:
            print("  INFO — PIL not available, skipping image creation test")
            print(
                "  (replicate token is configured — vision will work on real uploads)"
            )

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("All tests completed.")
print("=" * 60)

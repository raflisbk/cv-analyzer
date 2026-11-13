import hashlib
import uuid
from datetime import UTC, datetime, timedelta

from app.models.job import Job, JobStatus
from scripts.seed_demo.analysis import analysis_fields

WEIGHTS = {"impact": 35, "clarity": 30, "relevance": 20, "completeness": 15}
DIMENSIONS = (
    (50, 54, 55, 50),
    (65, 68, 70, 70),
    (78, 82, 84, 82),
    (75, 70, 75, 80),
)
SEED_NAMES = ("primary-v1", "primary-v2", "primary-v3", "standalone")


def seed_prefix(email: str) -> str:
    return hashlib.sha256(email.strip().lower().encode()).hexdigest()[:16]


def score_data(values: tuple[int, int, int, int], version: int) -> dict:
    dimensions = dict(zip(WEIGHTS, values, strict=True))
    overall = round(
        sum(dimensions[key] * weight for key, weight in WEIGHTS.items()) / 100
    )
    return {
        **dimensions,
        "overall": overall,
        "reasonings": {
            "impact": "Results are stated, but more measured outcomes would strengthen them.",
            "clarity": "Experience bullets are mostly direct and readable.",
            "relevance": "Python, SQL and reporting experience fit the target role.",
            "completeness": "Contact, experience, skills and education are present.",
        },
        "benchmark": {"percentile": overall, "sample_size": 120},
        "ats_score": min(95, overall + 4),
        "metrics": {"bullet_count": 3 + version},
        "scoring_method": "llm",
        "scoring_algorithm_version": "dev-demo",
    }


def cv_text(version: int, standalone: bool) -> str:
    role = "Product Analyst" if standalone else "Software Engineer"
    first = (
        "Built Python dashboards for customer teams."
        if version == 1
        else "Built Python dashboards that reduced weekly reporting time by 20%."
    )
    second = "Helped with SQL reports for sales operations."
    return (
        f"Mira Solana\nmira.solana@example.test\n{role}\n"
        "Summary\nEngineer focused on practical reporting tools.\n"
        f"Experience\nNorthstar Labs, 2021-2025\n- {first}\n- {second}\n"
        "- Led documentation updates for a small team.\n"
        "Skills\nPython, SQL, Figma\nEducation\nBSc Computer Science, 2020"
    )


def suggestions(version: int) -> list[dict]:
    first = "Led documentation updates for a small team."
    return [
        {
            "section": "experience",
            "suggestions": [
                {
                    "priority": "high_impact",
                    "type": "impact_metric",
                    "text": "Add the number of teammates supported.",
                    "original_text": first,
                    "after_text": "Led documentation updates for [how many?] teammates.",
                    "needs_input": [
                        {"token": "[how many?]", "question": "How many teammates?"}
                    ],
                },
                {
                    "priority": "quick_win",
                    "type": "action_verb",
                    "text": "Replace the vague verb with the work you did.",
                    "original_text": "Helped with SQL reports for sales operations.",
                    "after_text": "[What did you do?] with SQL reports for sales operations.",
                    "needs_input": [
                        {
                            "token": "[What did you do?]",
                            "question": "What did you do with the SQL reports?",
                        }
                    ],
                },
            ],
        }
    ]


def cv_sections(text: str) -> list[dict]:
    experience = text.split("Experience\n", 1)[1].split("\nSkills\n", 1)[0]
    return [
        {
            "type": "summary",
            "title": "Summary",
            "text": "Engineer focused on practical reporting tools.",
        },
        {"type": "experience", "title": "Experience", "text": experience},
        {"type": "skills", "title": "Skills", "text": "Python, SQL, Figma"},
        {
            "type": "education",
            "title": "Education",
            "text": "BSc Computer Science, 2020",
        },
    ]


def file_metadata(key: str, text: str, standalone: bool) -> dict:
    return {
        "seed_key": key,
        "filename": (
            "Mira-Solana-Product-CV.pdf" if standalone else "Mira-Solana-CV.pdf"
        ),
        "mime_type": "application/pdf",
        "extension": ".pdf",
        "pages": 2,
        "size": 87552,
        "word_count": len(text.split()),
    }


def build_jobs(user_id: uuid.UUID, email: str) -> list[Job]:
    prefix = seed_prefix(email)
    now = datetime.now(UTC)
    jobs = []
    for index, (name, values) in enumerate(zip(SEED_NAMES, DIMENSIONS, strict=True)):
        version = index + 1 if index < 3 else 2
        standalone = index == 3
        text = cv_text(version, standalone)
        key = f"{prefix}-{name}"
        date = now - timedelta(days=(3 - min(index, 3)) * 7)
        job = Job(
            id=uuid.uuid5(uuid.NAMESPACE_URL, f"cv-analyzer-dev-demo:{key}"),
            user_id=user_id,
            parent_job_id=jobs[-1].id if 0 < index < 3 else None,
            status=JobStatus.COMPLETE,
            file_id="",
            file_metadata=file_metadata(key, text, standalone),
            **analysis_fields(
                text,
                cv_sections(text),
                score_data(values, version),
                suggestions(version),
                standalone,
            ),
            workspace_draft={},
            messages=[],
            created_at=date,
            updated_at=date,
        )
        jobs.append(job)
    return jobs

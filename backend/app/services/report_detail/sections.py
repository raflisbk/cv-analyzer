from app.models.job import Job
from app.schemas.report_detail import ReportSection
from app.services.report_detail.bullets import NUMBER, bullet_lines

WORDS_FULL = 50
BULLETS_FULL = 3
METRICS_FULL = 2
NOTES = (
    (80, "Detailed section with measurable evidence."),
    (50, "Add more concrete detail to this section."),
    (0, "This section needs more detail."),
)


def section_score(text: str) -> int:
    bullets = bullet_lines(text)
    words = len(text.split())
    metrics = sum(bool(NUMBER.search(bullet)) for bullet in bullets)
    return round(
        40 * min(words / WORDS_FULL, 1)
        + 30 * min(len(bullets) / BULLETS_FULL, 1)
        + 30 * min(metrics / METRICS_FULL, 1)
    )


def sections(job: Job) -> list[ReportSection]:
    output = []
    for item in (job.nlp_result or {}).get("sections", []):
        text = str(item.get("text") or "")
        score = section_score(text)
        note = next(note for floor, note in NOTES if score >= floor)
        output.append(
            ReportSection(
                name=str(item.get("type") or "Other").title(), score=score, note=note
            )
        )
    return output

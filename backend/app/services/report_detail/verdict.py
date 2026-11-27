from app.models.job import Job
from app.schemas.report_detail import ReportFactCounts, ReportVerdict
from app.services.app_lists.cv_summaries import file_pages
from app.services.app_lists.report_summaries import bullet_count

VERDICTS = (
    (
        85,
        "strong",
        "Strong CV",
        "Your analysis shows strong evidence across the scored dimensions.",
    ),
    (
        70,
        "good",
        "Good foundation",
        "Several targeted edits could strengthen this CV.",
    ),
    (
        50,
        "room",
        "Room to improve",
        "Focus on the lowest scoring dimensions first.",
    ),
    (
        0,
        "needs",
        "Needs work",
        "Add concrete evidence and complete the missing details.",
    ),
)


def verdict(score: int) -> ReportVerdict:
    key, title, body = next(
        (key, title, body) for floor, key, title, body in VERDICTS if score >= floor
    )
    return ReportVerdict(key=key, title=title, body=body)


def fact_counts(job: Job) -> ReportFactCounts:
    words = len(str((job.result or {}).get("text") or "").split())
    return ReportFactCounts(
        pages=file_pages(job), bullets=bullet_count(job), words=words
    )


def facts(job: Job) -> list[str]:
    counts = fact_counts(job)
    return [
        f"{counts.pages} pages",
        f"{counts.bullets} bullets",
        f"{counts.words} words",
        "Projected gains are estimates based on open suggestions.",
        "Missing keyword post counts are unknown when shown as 0.",
    ]

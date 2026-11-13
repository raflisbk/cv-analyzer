from app.models.job import Job
from app.schemas.report_detail import ReportVerdict
from app.services.app_lists.cv_summaries import file_pages
from app.services.app_lists.report_summaries import bullet_count

VERDICTS = (
    (
        85,
        "Strong CV",
        "Your analysis shows strong evidence across the scored dimensions.",
    ),
    (70, "Good foundation", "Several targeted edits could strengthen this CV."),
    (50, "Room to improve", "Focus on the lowest scoring dimensions first."),
    (0, "Needs work", "Add concrete evidence and complete the missing details."),
)


def verdict(score: int) -> ReportVerdict:
    title, body = next(
        (title, body) for floor, title, body in VERDICTS if score >= floor
    )
    return ReportVerdict(title=title, body=body)


def facts(job: Job) -> list[str]:
    words = len(str((job.result or {}).get("text") or "").split())
    return [
        f"{file_pages(job)} pages",
        f"{bullet_count(job)} bullets",
        f"{words} words",
        "Projected gains are estimates based on open suggestions.",
        "Missing keyword post counts are unknown when shown as 0.",
    ]

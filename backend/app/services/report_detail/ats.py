from pathlib import Path

from app.models.job import Job
from app.schemas.report_detail import AtsCheckView, ReportAts
from app.services.app_lists.cv_summaries import file_pages, nonnegative_int
from app.services.ats.checker import compute_ats_score


def ats(job: Job) -> ReportAts:
    metadata = job.file_metadata or {}
    checks = job.ats_checks or []
    stored_score = (job.scores or {}).get("ats_score")
    score = stored_score if stored_score is not None else compute_ats_score(checks)
    file_format = Path(metadata.get("filename") or "").suffix.lstrip(".").upper()
    pages = file_pages(job)
    size_kb = round(nonnegative_int(metadata.get("size")) / 1024)
    facts = [file_format, f"{pages} pages", f"{size_kb} KB"]
    return ReportAts(
        score=score,
        format=file_format,
        pages=pages,
        size_kb=size_kb,
        facts=[fact for fact in facts if fact],
        checks=[
            AtsCheckView(
                text=str(check.get("check") or ""), ok=check.get("status") == "pass"
            )
            for check in checks
        ],
    )

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
    facts = [
        Path(metadata.get("filename") or "").suffix.lstrip(".").upper(),
        f"{file_pages(job)} pages",
        f"{round(nonnegative_int(metadata.get('size')) / 1024)} KB",
    ]
    return ReportAts(
        score=score,
        facts=[fact for fact in facts if fact],
        checks=[
            AtsCheckView(
                text=str(check.get("check") or ""), ok=check.get("status") == "pass"
            )
            for check in checks
        ],
    )

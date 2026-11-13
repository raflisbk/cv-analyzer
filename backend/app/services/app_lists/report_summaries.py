from pathlib import Path

from app.models.job import Job, JobStatus
from app.schemas.app_lists import Dimensions, FileFacts, ReportSummary
from app.services.app_lists.cv_summaries import file_pages, nonnegative_int
from app.services.app_lists.version_chain import latest_jobs, version_chain


def suggestion_items(job: Job) -> list[dict]:
    cards = job.suggestions if isinstance(job.suggestions, list) else []
    return [
        item
        for card in cards
        if isinstance(card, dict)
        for item in card.get("suggestions", [])
        if isinstance(item, dict)
    ]


def bullet_count(job: Job) -> int:
    metrics = (job.scores or {}).get("metrics") or {}
    if "bullet_count" in metrics:
        return nonnegative_int(metrics["bullet_count"])
    sections = (
        (job.nlp_result or {}).get("sections")
        or (job.cv_document or {}).get("sections")
        or []
    )
    return sum(
        1
        for section in sections
        if isinstance(section, dict)
        for line in str(
            section.get("text") or section.get("content") or ""
        ).splitlines()
        if line.lstrip().startswith(("•", "- ", "* "))
    )


def report_summaries(jobs: list[Job]) -> list[ReportSummary]:
    jobs_by_id = {job.id: job for job in jobs}
    reports = []
    for job in latest_jobs(jobs):
        if job.status != JobStatus.COMPLETE or not job.scores:
            continue
        metadata = job.file_metadata or {}
        scores = job.scores
        items = suggestion_items(job)
        top_fix = next(
            (
                item.get("text", "")
                for item in items
                if item.get("priority") == "high_impact" and item.get("text")
            ),
            "",
        )
        reports.append(
            ReportSummary(
                job_id=str(job.id),
                file_name=metadata.get("filename") or "",
                role=job.target_role,
                analyzed_at=job.updated_at.isoformat(),
                score=scores.get("overall", 0),
                dimensions=Dimensions(
                    **{
                        key: scores.get(key, 0)
                        for key in ("impact", "clarity", "relevance", "completeness")
                    }
                ),
                versions=version_chain(job, jobs_by_id),
                top_fix=top_fix,
                file_facts=FileFacts(
                    type=Path(metadata.get("filename") or "")
                    .suffix.lstrip(".")
                    .upper(),
                    pages=file_pages(job),
                    size_kb=round(nonnegative_int(metadata.get("size")) / 1024),
                    bullets=bullet_count(job),
                ),
            )
        )
    return reports

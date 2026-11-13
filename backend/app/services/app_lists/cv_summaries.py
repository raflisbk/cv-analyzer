from app.models.job import Job
from app.schemas.app_lists import CvSummary
from app.services.app_lists.version_chain import latest_jobs


def nonnegative_int(value: object) -> int:
    return max(0, int(value)) if isinstance(value, (int, float)) else 0


def file_pages(job: Job) -> int:
    return nonnegative_int((job.file_metadata or {}).get("pages"))


def cv_summaries(jobs: list[Job]) -> list[CvSummary]:
    summaries = []
    for job in latest_jobs(jobs):
        metadata = job.file_metadata or {}
        nlp = job.nlp_result or {}
        summaries.append(
            CvSummary(
                job_id=str(job.id),
                file_name=metadata.get("filename") or "",
                target_role=job.target_role,
                score=(job.scores or {}).get("overall"),
                status=job.status.value,
                updated_at=job.updated_at.isoformat(),
                pages=file_pages(job),
                word_count=nonnegative_int(
                    metadata.get("word_count") or nlp.get("word_count")
                ),
            )
        )
    return summaries

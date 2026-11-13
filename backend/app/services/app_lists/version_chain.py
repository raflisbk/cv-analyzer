from app.models.job import Job
from app.schemas.app_lists import VersionSummary


def latest_jobs(jobs: list[Job]) -> list[Job]:
    parent_ids = {job.parent_job_id for job in jobs if job.parent_job_id}
    return [job for job in jobs if job.id not in parent_ids]


def version_chain(job: Job, jobs_by_id: dict) -> list[VersionSummary]:
    chain = []
    seen = set()
    current = job
    while current and current.id not in seen:
        seen.add(current.id)
        chain.append(current)
        current = jobs_by_id.get(current.parent_job_id)
    return [
        VersionSummary(
            label=f"v{index}",
            score=(item.scores or {}).get("overall", 0),
            at=item.updated_at.isoformat(),
        )
        for index, item in enumerate(reversed(chain), 1)
    ]

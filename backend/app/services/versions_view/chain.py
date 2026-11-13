from app.models.job import Job
from app.schemas.report_detail import VersionData
from app.services.app_lists.version_chain import version_chain

DIMENSIONS = ("impact", "clarity", "relevance", "completeness")


def chain_jobs(job: Job, jobs_by_id: dict) -> list[Job]:
    chain = []
    seen = set()
    current = job
    while current and current.id not in seen:
        seen.add(current.id)
        chain.append(current)
        current = jobs_by_id.get(current.parent_job_id)
    return list(reversed(chain))


def versions(job: Job, jobs_by_id: dict) -> list[VersionData]:
    jobs = chain_jobs(job, jobs_by_id)
    summaries = version_chain(job, jobs_by_id)
    output = []
    for index, (item, base) in enumerate(zip(jobs, summaries, strict=True)):
        previous = jobs[index - 1] if index else None
        score = int(base.score)
        delta = (
            score - int((previous.scores or {}).get("overall", 0)) if previous else None
        )
        changes = (
            {
                key: int((item.scores or {}).get(key, 0))
                - int((previous.scores or {}).get(key, 0))
                for key in DIMENSIONS
            }
            if previous
            else {}
        )
        changed = (
            max(changes, key=lambda key: abs(changes[key]))
            if any(changes.values())
            else ""
        )
        summary = (
            f"Score {delta:+d}; {changed} {changes[changed]:+d}."
            if changed
            else "No dimension changed." if previous else "First analysis."
        )
        output.append(
            VersionData(
                id=str(item.id),
                label=base.label,
                at=base.at,
                score=score,
                delta=delta,
                summary=summary,
                current=item.id == job.id,
            )
        )
    return output

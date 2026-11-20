from app.models.job import Job
from app.schemas.report_detail import VersionData
from app.services.app_lists.version_chain import version_chain
from app.services.versions_restore.chain import full_chain

DIMENSIONS = ("impact", "clarity", "relevance", "completeness")


def versions(job: Job, jobs_by_id: dict) -> list[VersionData]:
    jobs = full_chain(job, jobs_by_id)
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
        changed = ""
        if any(changes.values()):
            changed = max(changes, key=lambda key: abs(changes[key]))
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
                current=item.id == jobs[-1].id,
            )
        )
    return output

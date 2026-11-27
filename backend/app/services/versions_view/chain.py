from app.models.job import Job
from app.schemas.report_detail import VersionData
from app.services.app_lists.version_chain import version_chain
from app.services.versions_restore.chain import full_chain
from app.services.versions_view.summary import dimension_changes, version_summary


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
        summary = version_summary(
            dimension_changes(item, previous), delta, previous is not None
        )
        output.append(
            VersionData(
                id=str(item.id),
                label=base.label,
                at=base.at,
                score=score,
                delta=delta,
                summary=summary.text,
                summary_kind=summary.kind,
                changed_dimension=summary.dimension,
                changed_delta=summary.dimension_delta,
                current=item.id == jobs[-1].id,
            )
        )
    return output

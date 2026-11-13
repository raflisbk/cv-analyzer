from app.models.job import Job
from app.schemas.report_detail import ReportDetail, ReportVersion
from app.services.report_detail.ats import ats
from app.services.report_detail.bullets import experience_bullets
from app.services.report_detail.dimensions import dimensions
from app.services.report_detail.fixes import fixes
from app.services.report_detail.grammar import grammar
from app.services.report_detail.identity import role, top_percent
from app.services.report_detail.keywords import keywords
from app.services.report_detail.sections import sections
from app.services.report_detail.verdict import facts, verdict
from app.services.versions_view.chain import versions


def report_detail(job: Job, jobs_by_id: dict) -> ReportDetail:
    history = versions(job, jobs_by_id)
    previous = jobs_by_id.get(job.parent_job_id)
    if previous and previous.id not in {item.id for item in history}:
        previous = None
    score = int((job.scores or {}).get("overall", 0))
    changes, gains = fixes(job)
    return ReportDetail(
        file_name=str((job.file_metadata or {}).get("filename") or ""),
        role=role(job),
        version=history[-1].label,
        score=score,
        previous_score=(
            int((previous.scores or {}).get("overall", score)) if previous else score
        ),
        projected_score=min(100, score + sum(item.points for item in changes)),
        verdict=verdict(score),
        top_percent=top_percent(job),
        facts=facts(job),
        fixes=changes,
        dimensions=dimensions(job, previous, gains),
        sections=sections(job),
        bullets=experience_bullets(job),
        grammar=grammar(job),
        keywords=keywords(job),
        ats=ats(job),
        versions=[
            ReportVersion(
                label=item.label, score=item.score, at=item.at, summary=item.summary
            )
            for item in history
        ],
    )

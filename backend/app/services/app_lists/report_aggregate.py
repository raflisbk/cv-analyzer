from collections import defaultdict

from app.models.job import Job
from app.schemas.app_lists import (
    Dimensions,
    RecurringFix,
    ReportAggregate,
    ReportSummary,
)
from app.services.app_lists.report_summaries import suggestion_items

DIMENSION_BY_TYPE = {
    "impact_metric": "impact",
    "action_verb": "clarity",
    "missing_section": "completeness",
}
DIMENSIONS = ("impact", "clarity", "relevance", "completeness")


def rounded_mean(values: list[float]) -> int:
    return round(sum(values) / len(values)) if values else 0


def recurring_fixes(
    reports: list[ReportSummary], jobs: list[Job]
) -> list[RecurringFix]:
    """Map impact_metric to impact, action_verb to clarity, missing_section to completeness."""
    jobs_by_id = {str(job.id): job for job in jobs}
    grouped = defaultdict(lambda: {"cv_ids": set(), "weight": 0.0, "text": ""})
    for report in reports:
        seen = set()
        for item in suggestion_items(jobs_by_id[report.job_id]):
            dimension = DIMENSION_BY_TYPE.get(item.get("type"))
            if not dimension or not item.get("text") or dimension in seen:
                continue
            seen.add(dimension)
            group = grouped[dimension]
            group["cv_ids"].add(report.job_id)
            group["weight"] += 5 - getattr(report.dimensions, dimension) / 20
            group["text"] = group["text"] or item["text"]
    ranked = sorted(
        grouped.items(),
        key=lambda pair: (-pair[1]["weight"], -len(pair[1]["cv_ids"]), pair[0]),
    )
    return [
        RecurringFix(
            dimension=name.capitalize(),
            cv_count=len(group["cv_ids"]),
            text=group["text"],
        )
        for name, group in ranked[:3]
    ]


def report_aggregate(reports: list[ReportSummary], jobs: list[Job]) -> ReportAggregate:
    if not reports:
        return ReportAggregate()
    jobs_by_id = {str(job.id): job for job in jobs}
    averages = Dimensions(
        **{
            key: rounded_mean([getattr(report.dimensions, key) for report in reports])
            for key in DIMENSIONS
        }
    )
    return ReportAggregate(
        count=len(reports),
        best_score=max(report.score for report in reports),
        average_impact=round(averages.impact),
        last_analysis_at=max(report.analyzed_at for report in reports),
        open_fixes=sum(
            len(suggestion_items(jobs_by_id[report.job_id])) for report in reports
        ),
        recurring_fixes=recurring_fixes(reports, jobs),
        average_by_dimension=averages,
    )

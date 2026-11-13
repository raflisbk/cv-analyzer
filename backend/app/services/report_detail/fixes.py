from app.models.job import Job
from app.schemas.report_detail import ReportFix
from app.services.app_lists.report_summaries import suggestion_items

WEIGHTS = {"impact": 35, "clarity": 30, "relevance": 20, "completeness": 15}
TYPE_DIMENSION = {
    "impact_metric": "impact",
    "action_verb": "clarity",
    "missing_section": "completeness",
}


def suggestion_dimension(item: dict) -> str:
    return TYPE_DIMENSION.get(item.get("type"), "relevance")


def fixes(job: Job) -> tuple[list[ReportFix], dict[str, int]]:
    items = [item for item in suggestion_items(job) if item.get("text")]
    counts = {
        key: sum(suggestion_dimension(item) == key for item in items) for key in WEIGHTS
    }
    points_by_dimension = dict.fromkeys(WEIGHTS, 0)
    output = []
    for item in items:
        key = suggestion_dimension(item)
        score = int((job.scores or {}).get(key, 0))
        points = round((100 - score) * WEIGHTS[key] / 100 / counts[key])
        points_by_dimension[key] += points
        output.append(
            ReportFix(
                title=str(item.get("priority") or "Fix").replace("_", " ").title(),
                text=str(item["text"]),
                points=points,
            )
        )
    return output, points_by_dimension

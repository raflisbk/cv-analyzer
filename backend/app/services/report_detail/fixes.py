from app.models.job import Job
from app.schemas.report_detail import ReportFix

WEIGHTS = {"impact": 35, "clarity": 30, "relevance": 20, "completeness": 15}
TYPE_DIMENSION = {
    "impact_metric": "impact",
    "action_verb": "clarity",
    "missing_section": "completeness",
}
TITLES = {
    ("summary", "action_verb"): "Summary: be specific",
    ("summary", "impact_metric"): "Summary: show an outcome",
    ("experience", "action_verb"): "Experience: use an action verb",
    ("experience", "impact_metric"): "Experience: quantify the impact",
    ("skills", "missing_section"): "Skills: group by area",
    ("education", "missing_section"): "Education: add credentials",
}
TYPE_TITLES = {
    "action_verb": "use an action verb",
    "impact_metric": "quantify the impact",
    "missing_section": "add missing detail",
}


def suggestion_dimension(item: dict) -> str:
    return TYPE_DIMENSION.get(item.get("type"), "relevance")


def fixes(job: Job) -> tuple[list[ReportFix], dict[str, int]]:
    items = [
        {**item, "section": card.get("section", "Other")}
        for card in (job.suggestions or [])
        if isinstance(card, dict)
        for item in card.get("suggestions", [])
        if isinstance(item, dict) and item.get("text")
    ]
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
                title=TITLES.get(
                    (str(item["section"]).lower(), item.get("type")),
                    f"{str(item['section']).title()}: {TYPE_TITLES.get(item.get('type'), 'improve this section')}",
                ),
                text=str(item["text"]),
                points=points,
            )
        )
    return output, points_by_dimension

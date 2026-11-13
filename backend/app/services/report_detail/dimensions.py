from app.models.job import Job
from app.schemas.report_detail import ReportDimension, ReportEvidence, ReportMetric
from app.services.app_lists.report_summaries import suggestion_items
from app.services.report_detail.bullets import experience_bullets
from app.services.report_detail.fixes import WEIGHTS, suggestion_dimension
from app.services.report_detail.keywords import keywords

HINTS = {
    "impact": "Add verified results to experience bullets.",
    "clarity": "Use direct, concise wording.",
    "relevance": "Show relevant skills in context.",
    "completeness": "Fill in missing CV sections.",
}


def metric(label: str, count: int, total: int) -> ReportMetric:
    return ReportMetric(
        label=label,
        value=f"{count} of {total}",
        percent=round(100 * count / total) if total else 0,
    )


def dimension_metrics(job: Job) -> dict[str, list[ReportMetric]]:
    stored = (job.scores or {}).get("metrics") or {}
    count = int(stored.get("bullet_count") or 0)
    verbs = stored.get("action_verb_ratio") or {}
    coverage = stored.get("section_coverage") or {}
    found = coverage.get("found") or []
    missing = coverage.get("missing") or []
    terms = keywords(job)
    return {
        "impact": [
            metric(
                "Bullets with a number",
                round(count * float(stored.get("quantification_ratio") or 0)),
                count,
            )
        ],
        "clarity": [
            metric("Strong action verbs", int(verbs.get("strong") or 0), count),
            metric(
                "Active voice",
                round(100 * (1 - float(stored.get("passive_voice_ratio") or 0))),
                100,
            ),
        ],
        "relevance": [metric("Keywords found", len(terms.present), terms.total)],
        "completeness": [
            metric("Sections present", len(found), len(found) + len(missing))
        ],
    }


def dimensions(
    job: Job, previous: Job | None, gains: dict[str, int]
) -> list[ReportDimension]:
    scores = job.scores or {}
    prior = previous.scores or {} if previous else scores
    items = suggestion_items(job)
    bullets = experience_bullets(job)
    metrics = dimension_metrics(job)
    output = []
    for key in WEIGHTS:
        evidence = [
            ReportEvidence(
                text=str(item.get("original_text")),
                note="Suggested change",
                positive=False,
            )
            for item in items
            if suggestion_dimension(item) == key and item.get("original_text")
        ][:3]
        if key == "impact":
            evidence += [
                ReportEvidence(text=bullet.text, note="Strong bullet", positive=True)
                for bullet in bullets
                if bullet.strength == "strong"
            ][:2]
        score = int(scores.get(key, 0))
        output.append(
            ReportDimension(
                key=key,
                score=score,
                previous=int(prior.get(key, score)),
                projected=min(100, score + gains.get(key, 0)),
                description=str((scores.get("reasonings") or {}).get(key) or ""),
                metrics=metrics[key],
                hint=HINTS[key],
                evidence=evidence,
            )
        )
    return output

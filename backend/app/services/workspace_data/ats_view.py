from app.models.job import Job
from app.schemas.workspace_data import AtsData, AtsHiddenText
from app.services.workspace_data.ats_compat import compatibility
from app.services.workspace_data.ats_groups import grouped_checks
from app.services.workspace_data.ats_parsed import parsed_fields
from app.services.workspace_data.plain_text import plain_text

ESTIMATE_NOTE = (
    "System ratings are estimates from layout and structure rules, "
    "not tests against vendor parsers."
)


def ats_data(job: Job) -> AtsData:
    result = job.result or {}
    report = (result.get("metadata") or {}).get("hidden_text") or {}
    checks = job.ats_checks or []
    snippets = [str(item) for item in report.get("snippets") or [] if item]
    score = (job.scores or {}).get("ats_score")
    summary = ESTIMATE_NOTE
    if score is None:
        summary = f"ATS score is unavailable. {ESTIMATE_NOTE}"
    return AtsData(
        score=score if isinstance(score, (int, float)) else 0,
        summary=summary,
        compat=compatibility(checks),
        parsed=parsed_fields(job.nlp_result, result.get("text") or ""),
        plain_text=plain_text(result.get("text") or "", snippets),
        checks=grouped_checks(checks),
        hidden_text=AtsHiddenText(found=bool(report.get("count")), items=snippets),
    )

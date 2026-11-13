from app.models.job import Job
from app.schemas.report_detail import GrammarNote, ReportGrammar

MAX_NOTES = 5


def grammar(job: Job) -> ReportGrammar:
    counts = {"spelling": 0, "grammar": 0, "style": 0}
    notes = []
    for issue in job.grammar_issues or []:
        rule = str(issue.get("rule") or "").lower()
        kind = rule if rule in counts else "style"
        counts[kind] += 1
        if len(notes) < MAX_NOTES:
            notes.append(
                GrammarNote(
                    before=str(issue.get("text") or ""),
                    after=str(issue.get("suggestion") or ""),
                    location=str(issue.get("location") or rule.title()),
                )
            )
    return ReportGrammar(**counts, notes=notes)

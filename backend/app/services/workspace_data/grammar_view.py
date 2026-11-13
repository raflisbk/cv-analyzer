import hashlib

from app.models.job import Job
from app.schemas.workspace_data import GrammarData, GrammarNote
from app.services.workspace_data.grammar_stats import grammar_stats

CLOSED_STATUSES = {"accepted", "ignored"}
RULE_TYPES = {"SPELLING": "spelling", "GRAMMAR": "grammar", "PUNCTUATION": "grammar"}


def note_id(issue: dict) -> str:
    content = f"{issue.get('offset', 0)}\x00{issue.get('text', '')}"
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def issue_location(issue: dict, sections: list[dict], text: str) -> str:
    offset = issue.get("offset")
    if not isinstance(offset, int):
        return "CV"
    matches = []
    for section in sections:
        section_text = section.get("text") or ""
        start = text.find(section_text) if section_text else -1
        if start >= 0 and start <= offset < start + len(section_text):
            matches.append((len(section_text), str(section.get("type") or "CV")))
    if not matches:
        return "CV"
    return min(matches)[1].replace("_", " ").title()


def grammar_data(job: Job) -> GrammarData:
    text = (job.result or {}).get("text") or ""
    sections = (job.nlp_result or {}).get("sections") or []
    notes = []
    for issue in job.grammar_issues or []:
        if issue.get("status") in CLOSED_STATUSES:
            continue
        notes.append(
            GrammarNote(
                id=note_id(issue),
                type=RULE_TYPES.get(str(issue.get("rule", "")).upper(), "style"),
                location=issue_location(issue, sections, text),
                before=str(issue.get("text") or ""),
                after=str(issue.get("suggestion") or ""),
            )
        )
    return GrammarData(stats=grammar_stats(text), notes=notes)

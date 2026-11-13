from fastapi import HTTPException
from sqlalchemy.orm.attributes import flag_modified

from app.models.job import Job
from app.services.workspace_data.grammar_view import note_id

DECISION_STATUS = {"accept": "accepted", "ignore": "ignored"}


def decide_issue(job: Job, note_id_value: str, action: str) -> None:
    issues = job.grammar_issues or []
    for issue in issues:
        if note_id(issue) != note_id_value:
            continue
        if issue.get("status") != DECISION_STATUS[action]:
            issue["status"] = DECISION_STATUS[action]
            flag_modified(job, "grammar_issues")
        return
    raise HTTPException(status_code=404, detail="Grammar note not found.")

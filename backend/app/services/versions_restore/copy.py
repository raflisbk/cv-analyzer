from app.models.job import Job, JobStatus

COPIED_FIELDS = (
    "file_id",
    "file_metadata",
    "result",
    "nlp_result",
    "scores",
    "grammar_issues",
    "ats_checks",
    "suggestions",
    "comparison_result",
    "comparison_status",
    "jd_text",
    "jd_role_id",
    "target_role",
    "workspace_draft",
    "cv_document",
    "suggestion_anchors",
    "yjs_snapshot",
)


def restored_job(target: Job, latest: Job) -> Job:
    values = {field: getattr(target, field) for field in COPIED_FIELDS}
    return Job(
        status=JobStatus.COMPLETE,
        user_id=latest.user_id,
        parent_job_id=latest.id,
        **values,
    )

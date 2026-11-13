from difflib import SequenceMatcher

from app.models.job import Job
from app.schemas.report_detail import VersionDiff

MAX_TEXT_LENGTH = 20_000


def version_diff(job: Job, previous: Job | None) -> VersionDiff:
    before = str((previous.result or {}).get("text") or "") if previous else ""
    after = str((job.result or {}).get("text") or "")
    if len(before) + len(after) <= MAX_TEXT_LENGTH:
        return VersionDiff(before=before, after=after)
    old, new = before.split("\n\n"), after.split("\n\n")
    matcher = SequenceMatcher(a=old, b=new, autojunk=False)
    before_parts, after_parts = [], []
    for op, a, b, c, d in matcher.get_opcodes():
        if op != "equal":
            before_parts.extend(old[a:b])
            after_parts.extend(new[c:d])
    return VersionDiff(before="\n\n".join(before_parts), after="\n\n".join(after_parts))

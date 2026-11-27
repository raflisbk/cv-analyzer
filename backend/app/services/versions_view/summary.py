from dataclasses import dataclass

DIMENSIONS = ("impact", "clarity", "relevance", "completeness")


@dataclass(frozen=True)
class VersionSummary:
    kind: str
    dimension: str | None
    dimension_delta: int | None
    text: str


def dimension_changes(item, previous) -> dict[str, int]:
    if previous is None:
        return {}
    return {
        key: int((item.scores or {}).get(key, 0))
        - int((previous.scores or {}).get(key, 0))
        for key in DIMENSIONS
    }


def version_summary(
    changes: dict[str, int], delta: int | None, has_previous: bool
) -> VersionSummary:
    if not has_previous:
        return VersionSummary("first", None, None, "First analysis.")
    if not any(changes.values()):
        return VersionSummary("unchanged", None, None, "No dimension changed.")
    dimension = max(changes, key=lambda key: abs(changes[key]))
    change = changes[dimension]
    text = f"Score {delta:+d}; {dimension} {change:+d}."
    return VersionSummary("changed", dimension, change, text)

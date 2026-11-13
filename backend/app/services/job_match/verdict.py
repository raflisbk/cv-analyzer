from app.schemas.job_match import MatchRequirement

SCORE_BANDS = ((85, "Strong fit"), (70, "Good fit"), (50, "Stretch"), (0, "Weak fit"))


def verdict(score: int, requirements: list[MatchRequirement]) -> tuple[str, str]:
    band = next(label for threshold, label in SCORE_BANDS if score >= threshold)
    gaps = [
        item
        for item in requirements
        if item.weight == "must" and item.status == "missing"
    ]
    count = len(gaps)
    headline = f"{band}, {count} must-have gap{'s' if count != 1 else ''}"
    summary = (
        f"First missing must-have: {gaps[0].label}."
        if gaps
        else "No must-have gaps found."
    )
    return headline, summary

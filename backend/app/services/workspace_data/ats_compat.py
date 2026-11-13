from app.schemas.workspace_data import AtsCompatibility
from app.services.workspace_data.ats_groups import CHECK_GROUPS

STATUS_POINTS = {"pass": 5, "warn": 3, "fail": 1}
SYSTEM_GROUP_WEIGHTS = {
    "Workday": {
        "Structure": 3,
        "Contact": 2,
        "Content": 2,
        "Formatting": 3,
        "Safety": 2,
    },
    "Greenhouse": {
        "Structure": 2,
        "Contact": 2,
        "Content": 3,
        "Formatting": 2,
        "Safety": 2,
    },
    "Lever": {"Structure": 2, "Contact": 2, "Content": 3, "Formatting": 1, "Safety": 2},
    "Taleo": {"Structure": 3, "Contact": 2, "Content": 1, "Formatting": 3, "Safety": 2},
    "iCIMS": {"Structure": 3, "Contact": 2, "Content": 2, "Formatting": 2, "Safety": 2},
}
DEFAULT_GROUP_WEIGHT = 1


def compatibility(checks: list[dict]) -> list[AtsCompatibility]:
    """Ratings are weighted means of stored pass=5, warn=3, fail=1 results."""
    valid = [item for item in checks if item.get("status") in STATUS_POINTS]
    if not valid:
        return []
    result = []
    for system, weights in SYSTEM_GROUP_WEIGHTS.items():
        weighted = 0
        total = 0
        for item in valid:
            group = CHECK_GROUPS.get(item.get("check"), "Other")
            weight = weights.get(group, DEFAULT_GROUP_WEIGHT)
            weighted += STATUS_POINTS[item["status"]] * weight
            total += weight
        result.append(AtsCompatibility(system=system, rating=round(weighted / total)))
    return result

from app.schemas.workspace_data import AtsCheck

CHECK_GROUPS = {
    "Standard sections present": "Structure",
    "No tables detected": "Formatting",
    "No images detected": "Formatting",
    "Action verb density": "Content",
    "Contact information complete": "Contact",
    "Appropriate CV length": "Content",
    "Date formatting": "Structure",
    "Bullet point usage": "Formatting",
    "Quantified achievements": "Content",
    "LinkedIn profile": "Contact",
    "Clean formatting": "Formatting",
    "Markdown headers": "Structure",
    "URL density": "Contact",
    "No hidden text": "Safety",
}


def grouped_checks(checks: list[dict]) -> list[AtsCheck]:
    result = []
    for check in checks:
        status = check.get("status")
        if status not in {"pass", "warn", "fail"}:
            continue
        name = str(check.get("check") or "")
        result.append(
            AtsCheck(
                group=CHECK_GROUPS.get(name, "Other"),
                label=name,
                status=status,
            )
        )
    return result

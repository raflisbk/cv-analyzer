def hidden_text_check(report: dict | None) -> dict | None:
    if report is None:
        return None
    count = report.get("count", 0)
    if not count:
        return {
            "check": "No hidden text",
            "status": "pass",
            "detail": "No hidden text detected.",
        }
    noun = "span" if count == 1 else "spans"
    first = report.get("snippets", [""])[0]
    return {
        "check": "No hidden text",
        "status": "fail",
        "detail": f"{count} hidden text {noun}: {first}",
    }

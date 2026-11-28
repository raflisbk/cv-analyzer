from datetime import UTC, datetime


def build_cv_document(
    nlp_result: dict | None,
    suggestions_json: list | None,
    scores: dict | None,
) -> dict:
    cv_document: dict = {
        "sections": [],
        "metadata": {
            "extracted_at": datetime.now(UTC).isoformat(),
            "parser_version": "1.0",
        },
    }

    if nlp_result and "sections" in nlp_result:
        for section_data in nlp_result["sections"]:
            cv_document["sections"].append(
                {
                    "type": section_data.get("type", "unknown"),
                    "title": section_data.get("title", ""),
                    "content": section_data.get("text", ""),
                    "items": section_data.get("items", []),
                }
            )

    if suggestions_json:
        cv_document["suggestions"] = suggestions_json

    if scores:
        _s = scores if isinstance(scores, dict) else scores.__dict__
        clarity = _s.get("clarity", 0) or 0
        impact = _s.get("impact", 0) or 0
        completeness = _s.get("completeness", 0) or 0
        relevance = _s.get("relevance", 0) or 0
        overall = _s.get("overall") or int(
            impact * 0.35 + clarity * 0.30 + relevance * 0.20 + completeness * 0.15
        )
        cv_document["scores"] = {
            "overall": overall,
            "clarity": clarity,
            "impact": impact,
            "completeness": completeness,
            "relevance": relevance,
        }

    return cv_document

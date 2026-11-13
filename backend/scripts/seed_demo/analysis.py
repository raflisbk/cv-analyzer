def cv_document(sections: list[dict], cards: list[dict], scores: dict) -> dict:
    return {
        "sections": [
            {
                "type": part["type"],
                "title": part["title"],
                "content": part["text"],
                "items": [],
            }
            for part in sections
        ],
        "suggestions": cards,
        "scores": scores,
    }


def analysis_fields(
    text: str, sections: list[dict], scores: dict, cards: list[dict], standalone: bool
) -> dict:
    return {
        "result": {
            "text": text,
            "metadata": {"hidden_text": {"count": 1, "snippets": ["review-only"]}},
        },
        "nlp_result": {
            "sections": sections,
            "skills": ["Python", "SQL", "Figma"],
            "entities": {"persons": ["Mira Solana"], "locations": []},
            "detected_role": "Product Analyst" if standalone else "Software Engineer",
            "word_count": len(text.split()),
        },
        "scores": scores,
        "suggestions": cards,
        "grammar_issues": [
            {
                "text": "practical",
                "offset": text.find("practical"),
                "suggestion": "effective",
                "rule": "STYLE",
            }
        ],
        "ats_checks": [
            {
                "check": "Standard sections present",
                "status": "pass",
                "detail": "Four sections found",
            },
            {
                "check": "No hidden text",
                "status": "warn",
                "detail": "Review-only text detected",
            },
        ],
        "cv_document": cv_document(sections, cards, scores),
    }

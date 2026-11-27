import json
import re

from json_repair import repair_json
from pydantic import ValidationError

from app.core.logging import structured_logger as logger
from app.services.llm.suggestion_rewrite_repair import (
    fallback_rewrite,
    normalize_placeholders,
)
from app.services.llm.protocol import (
    SuggestionCardOutput,
    SuggestionItemOutput,
    SuggestionsOutput,
)


def _infer_type(suggestion: dict) -> None:
    if suggestion.get("type"):
        return
    text_lower = str(suggestion.get("text", "")).lower()
    if any(word in text_lower for word in ("add", "include", "missing", "section")):
        suggestion["type"] = "missing_section"
    elif any(
        word in text_lower for word in ("metric", "quantif", "number", "%", "increased")
    ):
        suggestion["type"] = "impact_metric"
    else:
        suggestion["type"] = "action_verb"


def _original_text(suggestion: dict, cv_text: str) -> str:
    if suggestion.get("type") == "action_verb":
        for verb in ("managed", "helped", "worked on", "assisted", "responsible for"):
            pos = cv_text.lower().find(verb)
            if pos >= 0:
                return cv_text[max(0, pos - 20) : min(len(cv_text), pos + 80)].strip()
    return str(suggestion.get("text", ""))[:100]


def _squash(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _repair_rewrite(suggestion: dict, cv_text: str) -> None:
    original = suggestion.get("original_text")
    if not isinstance(original, str) or not original.strip():
        return
    original = _squash(original)
    after = suggestion.get("after_text")
    if isinstance(after, str) and after.strip():
        suggestion["after_text"] = normalize_placeholders(_squash(after), original)
    elif _squash(cv_text).find(original) >= 0:
        suggestion["after_text"] = fallback_rewrite(suggestion, original)


def _repair_item(suggestion: dict, cv_text: str) -> None:
    _infer_type(suggestion)
    _repair_rewrite(suggestion, cv_text)
    if not suggestion.get("original_text"):
        suggestion["original_text"] = _original_text(suggestion, cv_text)
    if "after_text" not in suggestion:
        suggestion["after_text"] = None
    for field in ("original_text", "after_text"):
        val = suggestion.get(field)
        if val and isinstance(val, str):
            suggestion[field] = re.sub(r"\s+", " ", val).strip()


def _repair_llm_output(raw_json: str, cv_text: str) -> str:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return repair_json(raw_json)
    if not isinstance(data, dict) or not isinstance(data.get("suggestions"), list):
        return json.dumps(data)
    for card in data["suggestions"]:
        if isinstance(card, dict) and isinstance(card.get("suggestions"), list):
            for suggestion in card["suggestions"]:
                if isinstance(suggestion, dict):
                    _repair_item(suggestion, cv_text)
    return json.dumps(data)


def _parse_card(
    card: object, cv_text: str
) -> tuple[SuggestionCardOutput | None, int, set[str]]:
    if not isinstance(card, dict):
        return None, 1, {"model_type"}
    if not isinstance(card.get("suggestions"), list):
        return None, 1, {"missing" if "suggestions" not in card else "list_type"}
    try:
        valid_card = SuggestionCardOutput.model_validate({**card, "suggestions": []})
    except ValidationError as exc:
        return None, 1, {error["type"] for error in exc.errors()}
    dropped = 0
    error_types = set()
    for item in card["suggestions"]:
        try:
            valid_card.suggestions.append(
                SuggestionItemOutput.model_validate(item, context={"cv_text": cv_text})
            )
        except ValidationError as exc:
            dropped += 1
            error_types.update(error["type"] for error in exc.errors())
    return (
        valid_card if valid_card.suggestions or not card["suggestions"] else None,
        dropped,
        error_types,
    )


def parse_suggestions(raw_json: str, cv_text: str) -> SuggestionsOutput:
    try:
        data = json.loads(_repair_llm_output(raw_json, cv_text))
    except (ValueError, TypeError) as exc:
        logger.warning(
            "llm_suggestions_parse", kept=0, dropped=0, error_types=["json_invalid"]
        )
        raise ValueError("No valid suggestions: invalid JSON") from exc
    if not isinstance(data, dict) or not isinstance(data.get("suggestions"), list):
        logger.warning(
            "llm_suggestions_parse", kept=0, dropped=0, error_types=["root_invalid"]
        )
        raise TypeError("No valid suggestions: invalid root")
    if not data["suggestions"]:
        return SuggestionsOutput(suggestions=[])

    cards = []
    dropped = 0
    error_types = set()
    for raw_card in data["suggestions"]:
        card, card_dropped, card_errors = _parse_card(raw_card, cv_text)
        dropped += card_dropped
        error_types.update(card_errors)
        if card is not None:
            cards.append(card)
    kept = sum(len(card.suggestions) for card in cards)
    if dropped or not cards:
        logger.warning(
            "llm_suggestions_parse",
            kept=kept,
            dropped=dropped,
            error_types=sorted(error_types) if error_types else ["empty"],
        )
    if not cards:
        raise ValueError("No valid suggestions")
    return SuggestionsOutput(suggestions=cards)

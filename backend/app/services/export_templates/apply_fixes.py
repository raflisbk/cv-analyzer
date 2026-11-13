import re
from copy import deepcopy
from dataclasses import dataclass
from typing import Any

_TOKEN = re.compile(r"\[([^\[\]]+)\]")


@dataclass(frozen=True)
class Fix:
    id: str
    original: str
    replacement: str


@dataclass
class FixResult:
    document: dict[str, Any]
    fixes: list[Fix]
    applied: list[str]
    skipped: dict[str, str]


def _candidates(suggestions: list[dict]) -> dict[str, dict]:
    candidates = {}
    for card_index, card in enumerate(suggestions):
        section = card.get("section", "unknown")
        for item_index, item in enumerate(card.get("suggestions", [])):
            candidates[f"{section}_{item_index}_{card_index}"] = item
    return candidates


def _replacement(item: dict, answers: dict[str, str]) -> tuple[str | None, str]:
    replacement = item.get("after_text")
    original = item.get("original_text")
    if (
        not isinstance(original, str)
        or not original
        or not isinstance(replacement, str)
        or not replacement
    ):
        return None, "missing_text"
    for token in _TOKEN.findall(replacement):
        value = answers.get(token)
        if not isinstance(value, str) or not value.strip():
            return None, "needs_input"
        value = value.strip()
        if len(value) > 80 or any(ord(char) < 32 or ord(char) == 127 for char in value):
            return None, "invalid_answer"
        replacement = replacement.replace(f"[{token}]", value)
    return replacement, ""


def _selected_ids(candidates: dict[str, dict], fix_ids: list[str] | None) -> list[str]:
    if fix_ids is not None:
        return list(dict.fromkeys(fix_ids))
    return [
        key
        for key, item in candidates.items()
        if item.get("original_text") and item.get("after_text")
    ]


def apply_fixes(
    cv_document: dict[str, Any],
    suggestions: list[dict],
    fix_ids: list[str] | None = None,
    answers: dict[str, dict[str, str]] | None = None,
    *,
    original: bool = False,
) -> FixResult:
    document = deepcopy(cv_document)
    candidates = _candidates(suggestions)
    selected = _selected_ids(candidates, fix_ids)
    result = FixResult(document, [], [], {})
    for fix_id in selected:
        item = candidates.get(fix_id)
        if item is None:
            result.skipped[fix_id] = "unknown_fix"
            continue
        replacement, reason = _replacement(item, (answers or {}).get(fix_id, {}))
        if replacement is None:
            result.skipped[fix_id] = reason
            continue
        source = item["original_text"]
        if not original:
            section = next(
                (
                    part
                    for part in document.get("sections", [])
                    if source in (part.get("content") or part.get("text") or "")
                ),
                None,
            )
            if section is None:
                result.skipped[fix_id] = "text_not_found"
                continue
            key = "content" if "content" in section else "text"
            section[key] = section[key].replace(source, replacement, 1)
        result.fixes.append(Fix(fix_id, source, replacement))
        result.applied.append(fix_id)
    return result

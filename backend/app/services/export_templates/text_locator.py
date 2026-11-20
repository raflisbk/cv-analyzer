import re
import unicodedata

import fitz

_PUNCTUATION = ".,:;!?()[]{}\"'•-"
_DASHES = str.maketrans(
    {"–": "-", "—": "-", "−": "-", "‘": "'", "’": "'", "“": '"', "”": '"'}
)


def _word(value: str) -> str:
    return (
        unicodedata.normalize("NFKC", value)
        .translate(_DASHES)
        .casefold()
        .strip(_PUNCTUATION)
    )


def normalized_words(value: str) -> list[tuple[str, int, int]]:
    return [
        (word, match.start(), match.end())
        for match in re.finditer(r"\S+", value)
        if (word := _word(match.group()))
    ]


def normalized_span(haystack: str, needle: str) -> tuple[int, int] | None:
    words = normalized_words(haystack)
    target = [word for word, _, _ in normalized_words(needle)]
    if not target:
        return None
    for index in range(len(words) - len(target) + 1):
        if [word for word, _, _ in words[index : index + len(target)]] == target:
            return words[index][1], words[index + len(target) - 1][2]
    return None


def locate_pdf_text(page: fitz.Page, needle: str) -> list[fitz.Rect]:
    target = [word for word, _, _ in normalized_words(needle)]
    if not target:
        return []
    words = [
        (normalized, word)
        for word in page.get_text("words")
        if (normalized := _word(word[4]))
    ]
    for index in range(len(words) - len(target) + 1):
        selected = words[index : index + len(target)]
        if [value for value, _ in selected] != target:
            continue
        rectangles: list[fitz.Rect] = []
        line = None
        for _, word in selected:
            current = word[5:7]
            rect = fitz.Rect(word[:4])
            if current == line:
                rectangles[-1] |= rect
            else:
                rectangles.append(rect)
                line = current
        return rectangles
    return []

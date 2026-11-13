import re

from app.schemas.workspace_data import GrammarStats
from app.services.scoring.deterministic_metrics import _PASSIVE_PATTERN

WORD = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")
SENTENCE = re.compile(r"[^.!?\n]+")
CASUAL = re.compile(r"\b(?:gonna|wanna|kinda|lol|awesome)\b", re.IGNORECASE)
CONTRACTION = re.compile(r"\b[A-Za-z]+'(?:t|re|ve|ll|d|m|s)\b", re.IGNORECASE)
CASUAL_THRESHOLD = 2
PASSIVE_SHARE_THRESHOLD = 0.3
VOWELS = set("aeiouy")


def syllables(word: str) -> int:
    """Approximate English syllables by vowel groups, subtracting a final silent e."""
    lower = word.lower()
    groups = sum(
        char in VOWELS and (idx == 0 or lower[idx - 1] not in VOWELS)
        for idx, char in enumerate(lower)
    )
    if lower.endswith("e") and not lower.endswith("le") and groups > 1:
        groups -= 1
    return max(1, groups)


def grammar_stats(text: str) -> GrammarStats:
    sentences = [part.strip() for part in SENTENCE.findall(text) if part.strip()]
    words = WORD.findall(text)
    if not sentences or not words:
        return GrammarStats()
    word_count = len(words)
    sentence_count = len(sentences)
    syllable_count = sum(syllables(word) for word in words)
    grade = round(
        0.39 * word_count / sentence_count + 11.8 * syllable_count / word_count - 15.59,
        1,
    )
    passive_lines = sum(
        bool(_PASSIVE_PATTERN.search(line)) for line in text.splitlines()
    )
    casual_count = len(CASUAL.findall(text)) + len(CONTRACTION.findall(text))
    passive_share = passive_lines / max(
        1, len([line for line in text.splitlines() if line.strip()])
    )
    tone = "Professional"
    if casual_count >= CASUAL_THRESHOLD:
        tone = "Casual"
    elif passive_share > PASSIVE_SHARE_THRESHOLD:
        tone = "Passive"
    return GrammarStats(
        reading_grade=grade,
        words_per_sentence=round(word_count / sentence_count, 1),
        passive_lines=passive_lines,
        tone=tone,
    )

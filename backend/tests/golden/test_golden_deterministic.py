import json
import re
from pathlib import Path

import pytest

from app.services.ats.checker import check_ats_compatibility
from app.services.llm.cv_profile_extractor import _verbatim_unique
from app.services.nlp.section_detector import detect_sections
from app.services.scoring.deterministic_metrics import (
    _PASSIVE_PATTERN,
    compute_deterministic_metrics,
)

CASES = [
    json.loads(path.read_text())
    for path in sorted((Path(__file__).parent / "cases").glob("*.json"))
]


def test_case_inventory() -> None:
    assert len(CASES) == 12
    assert {
        group: sum(c["group"] == group for c in CASES)
        for group in ("weak", "average", "strong", "edge")
    } == {
        "weak": 3,
        "average": 4,
        "strong": 3,
        "edge": 2,
    }
    assert {
        language: sum(c["language"] == language for c in CASES)
        for language in ("id", "en")
    } == {"id": 6, "en": 6}


@pytest.mark.parametrize("case", CASES, ids=lambda case: case["id"])
def test_deterministic_labels(case: dict) -> None:
    sections = detect_sections(case["text"])
    expected = case["expected_deterministic"]
    assert [section.type for section in sections] == expected["sections"]
    nlp_result = {
        "sections": [
            {"type": section.type, "text": section.text} for section in sections
        ],
        "skills": expected["skills"],
    }
    metrics = compute_deterministic_metrics(
        case["text"], nlp_result, target_role=case["target_role"]
    )
    assert _verbatim_unique(
        expected["skills"] + ["invented-skill"], case["text"]
    ) == sorted(expected["skills"], key=str.lower)
    assert (
        expected["quantified_bullet_share"][0]
        <= metrics["quantification_ratio"]
        <= expected["quantified_bullet_share"][1]
    )
    sentences = [
        part.strip()
        for part in re.split(r"[.!?\n]", case["text"])
        if len(part.strip()) > 10
    ]
    passive_count = sum(
        bool(_PASSIVE_PATTERN.search(sentence)) for sentence in sentences
    )
    assert expected["passive_count"][0] <= passive_count <= expected["passive_count"][1]
    checks = check_ats_compatibility(case["text"], sections)
    for status in ("fail", "warn"):
        low, high = expected[f"ats_{status}_count"]
        assert low <= sum(check["status"] == status for check in checks) <= high


def test_weak_to_strong_mutation_changes_metrics() -> None:
    weak = next(case for case in CASES if case["id"] == "en_weak_support")
    improved = (
        weak["text"]
        .replace(
            "- Tickets were handled when needed.",
            "- Reduced ticket backlog 35% by resolving 120 requests each week.",
        )
        .replace("- Calls were answered.", "- Improved call response time 20%.")
    )
    before = compute_deterministic_metrics(weak["text"])
    after = compute_deterministic_metrics(improved)
    assert after["quantification_ratio"] > before["quantification_ratio"]
    assert after["passive_voice_ratio"] < before["passive_voice_ratio"]

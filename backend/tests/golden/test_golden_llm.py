import json
import os
from datetime import UTC, datetime
from pathlib import Path

import pytest

from app.core.config import get_settings
from app.services.scoring.llm_scorer import SCORING_VERSION, score_cv_with_llm

pytestmark = [
    pytest.mark.golden,
    pytest.mark.skipif(os.getenv("RUN_GOLDEN") != "1", reason="RUN_GOLDEN=1 required"),
]


def _band_failures(case: dict, scores: dict) -> list[str]:
    bands = {**case["expected_bands"], "overall": case["expected_overall_band"]}
    return [
        f"{case['id']} {key}: {scores[key]} outside {band}"
        for key, band in bands.items()
        if not band[0] <= scores[key] <= band[1]
    ]


def _print_results(results: dict) -> None:
    print("case                  impact clarity relevance completeness overall")
    for case_id, result in results.items():
        scores = result["scores"]
        print(
            f"{case_id:22} {scores['impact']:6} {scores['clarity']:7} {scores['relevance']:9} {scores['completeness']:12} {scores['overall']:7}"
        )


def _assert_order(results: dict) -> None:
    strong = [
        item["scores"]["overall"]
        for item in results.values()
        if item["group"] == "strong"
    ]
    weak = [
        item["scores"]["overall"]
        for item in results.values()
        if item["group"] == "weak"
    ]
    assert min(strong) > max(weak), "strong cases must score above weak cases"


def test_scoring_golden_set() -> None:
    cases = [
        json.loads(path.read_text())
        for path in sorted((Path(__file__).parent / "cases").glob("*.json"))
    ]
    settings = get_settings()
    assert settings.CV_ANALYZER_KOBOI_API_KEY
    results = {}
    failures = []
    for case in cases:
        scores = score_cv_with_llm(case["text"], target_role=case["target_role"])
        assert scores["scoring_method"] == "llm", case["id"]
        results[case["id"]] = {
            "group": case["group"],
            "scores": {
                key: scores[key] for key in (*case["expected_bands"], "overall")
            },
        }
        failures.extend(_band_failures(case, scores))
    payload = {
        "scoring_version": SCORING_VERSION,
        "model": settings.CV_ANALYZER_LLM_MODEL,
        "timestamp": datetime.now(UTC).isoformat(),
        "cases": results,
    }
    (Path(__file__).parent / "last_run.json").write_text(
        json.dumps(payload, indent=2) + "\n"
    )
    _print_results(results)
    _assert_order(results)
    assert not failures, "\n".join(failures)

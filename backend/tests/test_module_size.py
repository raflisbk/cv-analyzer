from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1] / "app"
MAX_MODULE_LINES = 300

DATA_MODULES = {"services/llm/archetype_registry.py"}

OVERSIZED_BASELINE = {
    "services/scoring/deterministic_metrics.py": 694,
    "services/scoring/llm_scorer.py": 644,
    "services/ats/checker.py": 618,
    "api/v1/endpoints/workspace.py": 593,
    "tasks/llm_suggest.py": 392,
    "services/llm/koboi_llm_service.py": 338,
    "services/scoring/anchors.py": 359,
    "services/nlp/section_detector.py": 333,
    "services/scoring/role_anchors.py": 301,
}


def _module_sizes() -> dict[str, int]:
    return {
        path.relative_to(APP_DIR).as_posix(): len(path.read_text().splitlines())
        for path in APP_DIR.rglob("*.py")
        if "__pycache__" not in path.parts
    }


def test_modules_stay_within_size_limit_or_baseline():
    too_big = {
        name: lines
        for name, lines in _module_sizes().items()
        if name not in DATA_MODULES
        and lines > max(MAX_MODULE_LINES, OVERSIZED_BASELINE.get(name, 0))
    }

    assert not too_big, (
        f"Split these modules (limit {MAX_MODULE_LINES} lines, or their baseline "
        f"in OVERSIZED_BASELINE if already oversized): {too_big}"
    )


def test_baseline_entries_are_removed_once_module_is_small_enough():
    sizes = _module_sizes()
    resolved = [
        name for name in OVERSIZED_BASELINE if sizes.get(name, 0) <= MAX_MODULE_LINES
    ]

    assert not resolved, f"Remove from OVERSIZED_BASELINE, now within limit: {resolved}"

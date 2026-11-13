import json
from pathlib import Path

from scripts.golden_fingerprint import current_fingerprint

FINGERPRINT_PATH = Path(__file__).parent / "scoring_fingerprint.json"


def test_scoring_version_guard() -> None:
    recorded = json.loads(FINGERPRINT_PATH.read_text())
    assert recorded == current_fingerprint(), (
        "Scoring prompt, weights or version changed: run the golden set, then bump "
        "SCORING_VERSION and refresh the fingerprint."
    )

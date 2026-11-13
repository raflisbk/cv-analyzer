import hashlib
import json
from pathlib import Path

from app.services.scoring.llm_scorer import SCORING_VERSION, _PROMPT, _WEIGHTS

FINGERPRINT_PATH = (
    Path(__file__).resolve().parents[1] / "tests/golden/scoring_fingerprint.json"
)


def current_fingerprint() -> dict:
    prompt_hash = hashlib.sha256(_PROMPT.encode()).hexdigest()
    weights_hash = hashlib.sha256(
        json.dumps(_WEIGHTS, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    return {
        "scoring_version": SCORING_VERSION,
        "prompt_sha256": prompt_hash,
        "weights_sha256": weights_hash,
    }


if __name__ == "__main__":
    FINGERPRINT_PATH.write_text(json.dumps(current_fingerprint(), indent=2) + "\n")
    print(FINGERPRINT_PATH)

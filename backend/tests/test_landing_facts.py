import json
import socket
from pathlib import Path

from scripts.landing_facts import build_facts

FACTS_PATH = Path(__file__).resolve().parents[2] / "frontend/lib/landing-facts.json"
REGENERATE = "Run cd backend && python scripts/landing_facts.py --write to regenerate."


def test_landing_facts_match_committed_json() -> None:
    assert build_facts() == json.loads(FACTS_PATH.read_text()), REGENERATE


def test_landing_facts_have_valid_shapes() -> None:
    facts = build_facts()
    assert set(facts) == {
        "archetypeCount",
        "domainCount",
        "atsCheckCount",
        "scoreDimensions",
        "exportTemplateCount",
        "languages",
    }
    assert all(
        isinstance(value, int) and value > 0
        for value in facts.values()
        if not isinstance(value, list)
    )
    assert facts["languages"]
    assert all(isinstance(value, str) and value for value in facts["languages"])


def test_landing_facts_do_not_use_network_or_llm(monkeypatch) -> None:
    def fail_network(*_args, **_kwargs):
        raise AssertionError("Facts generation attempted a network or LLM call")

    monkeypatch.setattr(socket.socket, "connect", fail_network)
    monkeypatch.setattr(socket, "create_connection", fail_network)
    from app.services.llm.koboi_llm_service import KoboiLLMService

    monkeypatch.setattr(KoboiLLMService, "_chat", fail_network)
    assert build_facts()["archetypeCount"] > 0

import argparse
import ast
import inspect
import json
from pathlib import Path

from app.services.ats import checker as ats_checker
from app.services.export_templates import registry as export_registry
from app.services.grammar import checker as grammar_checker
from app.services.llm.archetype_registry import REGISTRY
from app.services.scoring import llm_scorer

FACTS_PATH = Path(__file__).resolve().parents[2] / "frontend/lib/landing-facts.json"


def ats_check_names() -> set[str]:
    source = inspect.getsource(ats_checker.check_ats_compatibility)
    tree = ast.parse(source)
    names = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Dict):
            continue
        for key, value in zip(node.keys, node.values, strict=True):
            if isinstance(key, ast.Constant) and key.value == "check":
                if not isinstance(value, ast.Constant) or not isinstance(
                    value.value, str
                ):
                    raise ValueError("ATS check name is not a string literal")
                names.add(value.value)
    return names


def supported_languages() -> list[str]:
    prompts = vars(grammar_checker)
    language_codes = (
        key.removeprefix("_GRAMMAR_SYSTEM_PROMPT_").lower()
        for key in prompts
        if key.startswith("_GRAMMAR_SYSTEM_PROMPT_")
    )
    return sorted(language_codes)


def build_facts() -> dict[str, int | list[str]]:
    return {
        "archetypeCount": sum(
            len(domain["archetypes"]) for domain in REGISTRY.values()
        ),
        "domainCount": len(REGISTRY),
        "atsCheckCount": len(ats_check_names()),
        "scoreDimensions": len(llm_scorer._WEIGHTS),
        "exportTemplateCount": len(export_registry._TEMPLATES),
        "languages": supported_languages(),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    output = json.dumps(build_facts(), indent=2, sort_keys=True) + "\n"
    if args.write:
        FACTS_PATH.write_text(output)
    else:
        print(output, end="")


if __name__ == "__main__":
    main()

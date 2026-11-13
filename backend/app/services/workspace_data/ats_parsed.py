import re

from app.schemas.workspace_data import AtsParsedField
from app.services.contact_signals import has_phone_number

EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?<![\w@/])\+?\(?\d[\d\s().-]{6,20}\d(?![\w@])")
LINK = re.compile(r"\b(?:https?://|www\.)[^\s<>]+", re.IGNORECASE)
CONFIDENCE_ENTITY = 80
CONFIDENCE_SECTION = 70
CONFIDENCE_ROLE = 70
CONFIDENCE_PATTERN_VALIDATED = 100


def first_entity(entities: dict, key: str, text: str) -> str:
    values = entities.get(key) or []
    return next(
        (value for value in values if isinstance(value, str) and value in text), ""
    )


def section_value(sections: list[dict], kind: str) -> str:
    return next(
        (
            str(section.get("text", "")).strip().splitlines()[0]
            for section in sections
            if section.get("type") == kind and section.get("text", "").strip()
        ),
        "",
    )


def parsed_fields(nlp_result: dict | None, text: str) -> list[AtsParsedField]:
    nlp = nlp_result or {}
    entities = nlp.get("entities") or {}
    sections = nlp.get("sections") or []
    email = EMAIL.search(text)
    phone = next(
        (
            match.group().strip()
            for match in PHONE.finditer(text)
            if has_phone_number(match.group())
        ),
        "",
    )
    link = LINK.search(text)
    role = nlp.get("detected_role") or ""
    values = [
        ("Name", first_entity(entities, "persons", text), CONFIDENCE_ENTITY),
        ("Email", email.group() if email else "", CONFIDENCE_PATTERN_VALIDATED),
        ("Phone", phone, CONFIDENCE_PATTERN_VALIDATED),
        ("Location", first_entity(entities, "locations", text), CONFIDENCE_ENTITY),
        ("Links", link.group() if link else "", CONFIDENCE_PATTERN_VALIDATED),
        ("Headline", section_value(sections, "summary"), CONFIDENCE_SECTION),
        ("Latest role", role if role in text else "", CONFIDENCE_ROLE),
        ("Education", section_value(sections, "education"), CONFIDENCE_SECTION),
    ]
    return [
        AtsParsedField(field=field, value=value, confidence=confidence if value else 0)
        for field, value, confidence in values
    ]

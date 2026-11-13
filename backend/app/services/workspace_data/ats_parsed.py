import re

from app.schemas.workspace_data import AtsParsedField
from app.services.contact_signals import has_phone_number

EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?<![\w@/])\+?\(?\d[\d\s().-]{6,20}\d(?![\w@])")
LINK = re.compile(r"\b(?:https?://|www\.)[^\s<>]+", re.IGNORECASE)
ENTITY_CONFIDENCE = 0.8
SECTION_CONFIDENCE = 0.7
ROLE_CONFIDENCE = 0.7


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
        ("Name", first_entity(entities, "persons", text), ENTITY_CONFIDENCE),
        ("Email", email.group() if email else "", 1.0),
        ("Phone", phone, 1.0),
        ("Location", first_entity(entities, "locations", text), ENTITY_CONFIDENCE),
        ("Links", link.group() if link else "", 1.0),
        ("Headline", section_value(sections, "summary"), SECTION_CONFIDENCE),
        ("Latest role", role if role in text else "", ROLE_CONFIDENCE),
        ("Education", section_value(sections, "education"), SECTION_CONFIDENCE),
    ]
    return [
        AtsParsedField(field=field, value=value, confidence=confidence if value else 0)
        for field, value, confidence in values
    ]

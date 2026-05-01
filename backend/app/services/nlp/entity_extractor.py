from app.services.nlp.model import get_nlp
from app.services.nlp.section_detector import CvSection

_LABEL_MAP: dict[str, str] = {
    "ORG": "organizations",
    "DATE": "dates",
    "PERSON": "persons",
    "GPE": "locations",
    "FAC": "locations",
    "LOC": "locations",
}


def extract_entities(text: str, sections: list[CvSection] | None = None) -> dict:
    nlp = get_nlp()
    doc = nlp(text)

    entities: dict[str, set[str]] = {
        "organizations": set(),
        "dates": set(),
        "persons": set(),
        "locations": set(),
    }

    for ent in doc.ents:
        category = _LABEL_MAP.get(ent.label_)
        if category:
            entities[category].add(ent.text.strip())

    result = {k: sorted(v) for k, v in entities.items()}

    if sections:
        for section in sections:
            section_doc = nlp(section.text)
            section_entities: list[dict] = []
            for ent in section_doc.ents:
                if ent.label_ in _LABEL_MAP:
                    section_entities.append(
                        {
                            "text": ent.text.strip(),
                            "label": ent.label_,
                            "type": _LABEL_MAP[ent.label_],
                        }
                    )
            section.entities = section_entities

    return result

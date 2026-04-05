"""
Entity extraction service per D-03 and NLP-05.
Extracts ORG, DATE, PERSON, GPE entities from CV sections using spaCy NER.
"""

from app.services.nlp.model import get_nlp
from app.services.nlp.section_detector import CvSection


# spaCy NER label mapping to our entity types
_LABEL_MAP: dict[str, str] = {
    "ORG": "organizations",
    "DATE": "dates",
    "PERSON": "persons",
    "GPE": "locations",  # Geo-Political Entities (countries, cities)
    "FAC": "locations",  # Facilities
    "LOC": "locations",  # Locations
}


def extract_entities(text: str, sections: list[CvSection] | None = None) -> dict:
    """
    Extract named entities from CV text using spaCy NER per D-03, NLP-05.

    Args:
        text: Full CV text or section text
        sections: Optional list of CvSection to annotate with entities (mutates in place)

    Returns:
        Dict with keys: 'organizations', 'dates', 'persons', 'locations'
        Each value is a list of unique entity strings.
    """
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

    # If sections provided, annotate each section with its entities
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

from app.services.report_detail.bullets import bullet_view
from app.services.report_detail.sections import sections
from types import SimpleNamespace


def test_bullet_tag_keys_match_tags():
    bullet = bullet_view("Built a 3 service platform for the team", "Acme")
    assert bullet.tag_keys == ["actionVerb", "number", "scannableLength"]
    assert len(bullet.tags) == len(bullet.tag_keys)


def test_section_exposes_stable_key_and_note_key():
    job = SimpleNamespace(nlp_result={"sections": [{"type": "skills", "text": ""}]})
    section = sections(job)[0]
    assert (section.key, section.note_key) == ("skills", "empty")

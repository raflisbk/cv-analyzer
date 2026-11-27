from types import SimpleNamespace

from app.services.report_detail.fixes import fixes


def test_fix_title_describes_section_and_action():
    job = SimpleNamespace(
        scores={"clarity": 70},
        suggestions=[
            {
                "section": "experience",
                "suggestions": [
                    {
                        "text": "Lead with a verb",
                        "type": "action_verb",
                        "priority": "quick_win",
                    }
                ],
            }
        ],
    )
    assert fixes(job)[0][0].title == "Experience: use an action verb"


def test_fix_carries_section_and_type_for_translation():
    job = SimpleNamespace(
        scores={"clarity": 70},
        suggestions=[
            {
                "section": "experience",
                "suggestions": [{"text": "Lead with a verb", "type": "action_verb"}],
            }
        ],
    )
    fix = fixes(job)[0][0]
    assert (fix.section, fix.type) == ("experience", "action_verb")

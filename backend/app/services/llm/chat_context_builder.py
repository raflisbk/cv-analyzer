from app.models.job import Job
from app.schemas.analysis import ScoreResult


def build_chat_system_prompt(job: Job) -> str:
    context_parts = [
        "## CV Analysis Context",
    ]

    if job.scores:
        scores = (
            ScoreResult(**job.scores) if isinstance(job.scores, dict) else job.scores
        )
        context_parts.append(f"Overall Score: {scores.overall}/100")
        context_parts.extend(
            [
                f"Clarity: {scores.clarity}/100",
                f"Impact: {scores.impact}/100",
                f"Completeness: {scores.completeness}/100",
                f"Relevance: {scores.relevance}/100",
            ]
        )
    else:
        context_parts.append("Overall Score: N/A")

    suggestions = job.suggestions or []
    if suggestions:
        context_parts.append(f"\n## Suggestions ({len(suggestions)} sections)")
        for section in suggestions[:5]:
            section_name = (
                section.get("section", "Unknown")
                if isinstance(section, dict)
                else section.section
            )
            count = (
                len(section.get("suggestions", []))
                if isinstance(section, dict)
                else len(section.suggestions)
            )
            context_parts.append(f"- {section_name}: {count} suggestions")

    grammar_issues = job.grammar_issues or []
    if grammar_issues:
        context_parts.append(f"\n## Grammar Issues ({len(grammar_issues)} found)")

    if job.nlp_result:
        skills = job.nlp_result.get("skills", [])
        if skills:
            context_parts.append(f"\n## Skills ({len(skills)} found)")
            context_parts.append(", ".join(skills[:20]))

    if job.comparison_result:
        context_parts.append("\n## Skills Gap")
        context_parts.append(f"Match: {job.comparison_result.get('match_pct', 'N/A')}%")
        matched = job.comparison_result.get("matched_skills", [])
        if matched:
            context_parts.append(f"Present: {', '.join(matched[:10])}")
        missing = job.comparison_result.get("missing_skills", [])
        if missing:
            context_parts.append(f"Missing: {', '.join(missing[:10])}")

    if job.cv_document and "sections" in job.cv_document:
        context_parts.append("\n## CV Document Structure")
        for section in job.cv_document["sections"][:8]:
            section_type = section.get("type", "unknown")
            section_title = section.get("title", "")
            items_count = len(section.get("items", []))
            if section_type == "header":
                context_parts.append(f"- Header: {section_title or 'CV Header'}")
            elif section_type == "experience":
                context_parts.append(f"- Experience: {items_count} positions")
            elif section_type == "education":
                context_parts.append(f"- Education: {items_count} entries")
            elif section_type == "skills":
                skills_list = section.get("items", [])[:5]
                context_parts.append(f"- Skills: {', '.join(skills_list)}")
            else:
                context_parts.append(
                    f"- {section_type.title()}: {section_title or items_count} items"
                )

    return (
        "You are a CV optimization assistant. The user's CV has been analyzed with the following context:\n\n"
        + "\n".join(context_parts)
        + "\n\nProvide specific, actionable advice. Reference their actual CV content, structure, and sections when making suggestions. "
        "Keep responses concise (2-3 paragraphs max)."
    )

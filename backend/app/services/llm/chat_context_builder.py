"""Chat system prompt builder with full CV analysis context."""

from app.models.job import Job
from app.schemas.analysis import ScoreResult


def build_chat_system_prompt(job: Job) -> str:
    """Build LLM system prompt with full analysis context.

    Context includes:
    - CV scores (overall + 4 dimensions)
    - Full suggestions array (all sections, all priorities)
    - Grammar issues list
    - Skills gap (present, required, missing)

    Returns formatted system prompt string for LLM.
    """
    context_parts = [
        "## CV Analysis Context",
    ]

    # Scores
    if job.scores:
        scores = ScoreResult(**job.scores) if isinstance(job.scores, dict) else job.scores
        context_parts.append(f"Overall Score: {scores.overall}/100")
        context_parts.extend([
            f"Clarity: {scores.clarity}/100",
            f"Impact: {scores.impact}/100",
            f"Completeness: {scores.completeness}/100",
            f"Relevance: {scores.relevance}/100",
        ])
    else:
        context_parts.append("Overall Score: N/A")

    # Suggestions summary
    suggestions = job.suggestions or []
    if suggestions:
        context_parts.append(f"\n## Suggestions ({len(suggestions)} sections)")
        for section in suggestions[:5]:
            section_name = section.get("section", "Unknown") if isinstance(section, dict) else section.section
            count = len(section.get("suggestions", [])) if isinstance(section, dict) else len(section.suggestions)
            context_parts.append(f"- {section_name}: {count} suggestions")

    # Grammar issues
    grammar_issues = job.grammar_issues or []
    if grammar_issues:
        context_parts.append(f"\n## Grammar Issues ({len(grammar_issues)} found)")

    # Skills from NLP result
    if job.nlp_result:
        skills = job.nlp_result.get("skills", [])
        if skills:
            context_parts.append(f"\n## Skills ({len(skills)} found)")
            context_parts.append(", ".join(skills[:20]))

    # Skills gap from comparison result
    if job.comparison_result:
        context_parts.append("\n## Skills Gap")
        context_parts.append(f"Match: {job.comparison_result.get('match_pct', 'N/A')}%")
        matched = job.comparison_result.get("matched_skills", [])
        if matched:
            context_parts.append(f"Present: {', '.join(matched[:10])}")
        missing = job.comparison_result.get("missing_skills", [])
        if missing:
            context_parts.append(f"Missing: {', '.join(missing[:10])}")

    return (
        "You are a CV optimization assistant. The user's CV has been analyzed with the following context:\n\n"
        + "\n".join(context_parts)
        + "\n\nProvide specific, actionable advice. Reference their actual CV content when making suggestions. "
        "Keep responses concise (2-3 paragraphs max)."
    )

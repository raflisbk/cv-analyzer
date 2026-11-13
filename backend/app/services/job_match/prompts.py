from app.services.llm.untrusted import wrap_untrusted

MAX_CV_CHARS = 12000

SYSTEM_PROMPT = (
    "Extract up to 15 distinct job requirements as JSON: "
    '{"requirements":[{"label":"short JD phrase","weight":"must|nice",'
    '"category":"skills|experience|education|keywords|seniority",'
    '"status":"met|partial|missing","evidence_quote":"verbatim CV excerpt or empty"}]}. '
    "Labels must come from the job description, at most 60 characters. "
    "Only quote exact text from the CV; never invent evidence. "
    "A missing requirement has an empty evidence_quote. Return JSON only."
)


def build_prompt(jd_text: str, cv_text: str) -> str:
    jd = wrap_untrusted("job description", jd_text, 6000)
    cv = wrap_untrusted("cv text", cv_text, MAX_CV_CHARS)
    return f"Job description:\n{jd}\nCV text:\n{cv}"

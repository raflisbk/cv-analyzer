"""
Results endpoint per D-23.
GET /api/v1/jobs/{id}/results — returns full nested analysis result.
"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.analysis import (
    AnalysisResult,
    AtsCheck,
    ComparisonResult,
    GrammarIssue,
    ScoreResult,
    SectionResult,
    SuggestionCard,
    SuggestionItem,
)
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse


router = APIRouter()


@router.get(
    "/jobs/{job_id}/results",
    response_model=WrappedResponse[AnalysisResult],
    summary="Get full analysis results for a job",
)
async def get_job_results(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[AnalysisResult]:
    """
    Get full CV analysis results for a completed job per D-23.

    Returns nested JSON with scores, sections, skills, grammar_issues, ats_checks.
    If job is still processing, returns result with current status (partial data).
    If job failed, returns result with status='failed' and empty data fields.
    If job not found, returns wrapped 404 error.
    """
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND",
                    message=f"Job {job_id} not found. Analysis may have expired.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        # Build ScoreResult from JSONB column
        scores: ScoreResult | None = None
        if job.scores:
            scores = ScoreResult(
                overall=job.scores.get("overall", 0),
                clarity=job.scores.get("clarity", 0),
                impact=job.scores.get("impact", 0),
                completeness=job.scores.get("completeness", 0),
                relevance=job.scores.get("relevance", 0),
            )

        # Build SectionResult list from nlp_result JSONB
        sections: list[SectionResult] = []
        if job.nlp_result and job.nlp_result.get("sections"):
            for sec in job.nlp_result["sections"]:
                sections.append(
                    SectionResult(
                        type=sec.get("type", "other"),
                        text=sec.get("text", ""),
                        entities=sec.get("entities", []),
                    )
                )

        skills: list[str] = []
        if job.nlp_result and job.nlp_result.get("skills"):
            skills = job.nlp_result["skills"]

        # Build GrammarIssue list from grammar_issues JSONB
        grammar_issues: list[GrammarIssue] = []
        if job.grammar_issues:
            for issue in job.grammar_issues:
                grammar_issues.append(
                    GrammarIssue(
                        text=issue.get("text", ""),
                        offset=issue.get("offset", 0),
                        suggestion=issue.get("suggestion", ""),
                        rule=issue.get("rule", ""),
                    )
                )

        # Build AtsCheck list from ats_checks JSONB
        ats_checks: list[AtsCheck] = []
        if job.ats_checks:
            for check in job.ats_checks:
                ats_checks.append(
                    AtsCheck(
                        check=check.get("check", ""),
                        status=check.get("status", "pass"),
                        detail=check.get("detail", ""),
                    )
                )

        # Build SuggestionCard list from suggestions JSONB column (Phase 3 D-20)
        # None  = LLM failed (ERROR-02) → suggestions=null in response (frontend shows "unavailable")
        # []    = LLM succeeded, nothing to suggest → suggestions=[] (frontend shows "no suggestions")
        # [...] = Populated suggestions → suggestions=[...] (frontend renders cards)
        suggestions: list[SuggestionCard] | None = None
        if job.suggestions is not None:
            try:
                suggestions = [
                    SuggestionCard(
                        section=card.get("section", ""),
                        suggestions=[
                            SuggestionItem(
                                priority=item.get("priority", "quick_win"),
                                text=item.get("text", ""),
                                type=item.get("type", "action_verb"),
                            )
                            for item in card.get("suggestions", [])
                        ],
                    )
                    for card in job.suggestions
                ]
            except Exception:
                # Malformed JSONB — treat as LLM failed (return null, not 500 error)
                suggestions = None

        # Build ComparisonResult from comparison_result JSONB column (Phase 4 D-C9)
        # None = comparison not triggered or failed; populated = comparison complete
        # Guard isinstance: MagicMock-based tests don't set these fields → treat as None
        comparison_result: ComparisonResult | None = None
        safe_comparison_status: str | None = (
            job.comparison_status if isinstance(job.comparison_status, str) else None
        )
        if job.comparison_result and safe_comparison_status == "complete":
            try:
                comparison_result = ComparisonResult(**job.comparison_result)
            except Exception:
                comparison_result = None  # Malformed JSONB — treat as not available

        analysis_result = AnalysisResult(
            job_id=str(job.id),
            status=job.status,
            scores=scores,
            sections=sections,
            skills=skills,
            grammar_issues=grammar_issues,
            ats_checks=ats_checks,
            suggestions=suggestions,  # Phase 3: None=LLM failed, []=empty, [...]=results
            comparison_result=comparison_result,  # Phase 4 addition
            comparison_status=safe_comparison_status,  # Phase 4 addition
        )

        return WrappedResponse(
            data=analysis_result,
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as e:
        return WrappedResponse(
            error=ErrorDetail(code="RESULTS_FETCH_FAILED", message=str(e)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

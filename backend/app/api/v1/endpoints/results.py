import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.logging import structured_logger as logger
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

        scores = (
            ScoreResult(
                overall=job.scores.get("overall", 0),
                clarity=job.scores.get("clarity", 0),
                impact=job.scores.get("impact", 0),
                completeness=job.scores.get("completeness", 0),
                relevance=job.scores.get("relevance", 0),
            )
            if job.scores
            else None
        )

        sections = [
            SectionResult(
                type=sec.get("type", "other"),
                text=sec.get("text", ""),
                entities=sec.get("entities", []),
            )
            for sec in (job.nlp_result or {}).get("sections", [])
        ]

        skills = (job.nlp_result or {}).get("skills", [])

        grammar_issues = [
            GrammarIssue(
                text=issue.get("text", ""),
                offset=issue.get("offset", 0),
                suggestion=issue.get("suggestion", ""),
                rule=issue.get("rule", ""),
            )
            for issue in (job.grammar_issues or [])
        ]

        ats_checks = [
            AtsCheck(
                check=check.get("check", ""),
                status=check.get("status", "pass"),
                detail=check.get("detail", ""),
            )
            for check in (job.ats_checks or [])
        ]

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
                                original_text=item.get("original_text"),
                                after_text=item.get("after_text"),
                            )
                            for item in card.get("suggestions", [])
                        ],
                    )
                    for card in job.suggestions
                ]
            except Exception:
                logger.warning("malformed_suggestions_jsonb", job_id=job_id)
                suggestions = None

        comparison_result: ComparisonResult | None = None
        safe_comparison_status = (
            job.comparison_status if isinstance(job.comparison_status, str) else None
        )
        if job.comparison_result and safe_comparison_status == "complete":
            try:
                comparison_result = ComparisonResult(**job.comparison_result)
            except Exception:
                logger.warning("malformed_comparison_jsonb", job_id=job_id)
                comparison_result = None

        return WrappedResponse(
            data=AnalysisResult(
                job_id=str(job.id),
                status=job.status,
                scores=scores,
                sections=sections,
                skills=skills,
                grammar_issues=grammar_issues,
                ats_checks=ats_checks,
                suggestions=suggestions,
                comparison_result=comparison_result,
                comparison_status=safe_comparison_status,
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        logger.error("results_fetch_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(code="RESULTS_FETCH_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

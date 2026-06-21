import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.dependencies import check_job_access, get_current_user
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.analysis import (
    AnalysisResult,
    ArchetypeResult,
    AtsCheck,
    BenchmarkResult,
    ComparisonResult,
    GrammarIssue,
    JdRedFlag,
    ScoreResult,
    ScoreVersion,
    SectionResult,
    SkillGapItem,
    SuggestionCard,
    SuggestionItem,
)
from app.services.skills_gap import rank_skill_gaps
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
    current_user: User | None = Depends(get_current_user),
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

        check_job_access(job, current_user)

        raw_scores = job.scores or {}
        raw_benchmark = raw_scores.get("benchmark", {}) or {}
        scores = (
            ScoreResult(
                overall=raw_scores.get("overall", 0),
                clarity=raw_scores.get("clarity", 0),
                impact=raw_scores.get("impact", 0),
                completeness=raw_scores.get("completeness", 0),
                relevance=raw_scores.get("relevance", 0),
                reasonings=raw_scores.get("reasonings", {}),
                jd_relevance=raw_scores.get("jd_relevance", False),
                target_role=raw_scores.get("target_role") or job.target_role,
                benchmark=BenchmarkResult(
                    percentile=raw_benchmark.get("percentile", 0),
                    sample_size=raw_benchmark.get("sample_size", 0),
                ),
                scoring_method=raw_scores.get("scoring_method", "llm"),
                scoring_algorithm_version=raw_scores.get(
                    "scoring_algorithm_version", "v3"
                ),
                metrics=raw_scores.get("metrics", {}),
                low_confidence=raw_scores.get("low_confidence", False),
                version_delta=raw_scores.get("version_delta"),
                ensemble_runs=raw_scores.get("ensemble_runs", 1),
                score_ranges=raw_scores.get("score_ranges", {}),
                ats_score=raw_scores.get("ats_score"),
                jd_keyword_gap=raw_scores.get("jd_keyword_gap"),
                grammar_clarity_penalty=raw_scores.get("grammar_clarity_penalty"),
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

        raw_archetype = (job.nlp_result or {}).get("archetype")
        archetype = (
            ArchetypeResult(**raw_archetype)
            if isinstance(raw_archetype, dict)
            else None
        )

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
                raw_comp = dict(job.comparison_result)
                raw_comp.pop("skill_gaps", None)  # computed below, not stored
                missing = raw_comp.get("missing_skills", [])
                skill_gaps = [SkillGapItem(**g) for g in rank_skill_gaps(missing)]
                # Coerce red_flags dicts to JdRedFlag instances
                raw_red_flags = raw_comp.pop("red_flags", []) or []
                red_flags = [
                    JdRedFlag(**f) if isinstance(f, dict) else f for f in raw_red_flags
                ]
                comparison_result = ComparisonResult(
                    **raw_comp, skill_gaps=skill_gaps, red_flags=red_flags
                )
            except Exception:
                logger.warning("malformed_comparison_jsonb", job_id=job_id)
                comparison_result = None

        # Build version history (walk parent chain, max 10 hops)
        version_history: list[ScoreVersion] = []
        try:
            visited: list[Job] = [job]
            current = job
            for _ in range(9):
                if not current.parent_job_id:
                    break
                stmt_p = select(Job).where(Job.id == current.parent_job_id)
                res_p = await db.execute(stmt_p)
                parent = res_p.scalar_one_or_none()
                if not parent:
                    break
                visited.append(parent)
                current = parent

            if len(visited) > 1:
                for i, v in enumerate(reversed(visited)):
                    prev = visited[len(visited) - i] if i > 0 else None
                    prev_overall = (
                        (prev.scores or {}).get("overall", 0) if prev else None
                    )
                    curr_overall = (v.scores or {}).get("overall", 0)
                    delta = (
                        (curr_overall - prev_overall)
                        if prev_overall is not None
                        else None
                    )
                    version_history.append(
                        ScoreVersion(
                            job_id=str(v.id),
                            version=i + 1,
                            overall=curr_overall,
                            created_at=v.created_at.isoformat() if v.created_at else "",
                            delta=delta,
                        )
                    )
        except Exception:
            logger.warning("version_history_failed", job_id=job_id)

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
                parent_job_id=str(job.parent_job_id) if job.parent_job_id else None,
                version_history=version_history,
                archetype=archetype,
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        logger.error("results_fetch_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(code="RESULTS_FETCH_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

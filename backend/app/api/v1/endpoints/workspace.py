"""Workspace hydration endpoint for Phase 11."""

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job, JobStatus
from app.schemas.analysis import (
    AtsCheck,
    ComparisonResult,
    ScoreResult,
    SectionResult,
    SuggestionCard,
    SuggestionItem,
)
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.workspace import (
    WorkspaceAnalysisContext,
    WorkspaceDocumentPayload,
    WorkspaceFileInfo,
    WorkspaceHydration,
    WorkspaceNavigation,
)


router = APIRouter()


def _build_scores(raw_scores: dict[str, Any] | None) -> ScoreResult | None:
    if not raw_scores:
        return None

    return ScoreResult(
        overall=raw_scores.get("overall", 0),
        clarity=raw_scores.get("clarity", 0),
        impact=raw_scores.get("impact", 0),
        completeness=raw_scores.get("completeness", 0),
        relevance=raw_scores.get("relevance", 0),
    )


def _build_sections(raw_nlp_result: dict[str, Any] | None) -> list[SectionResult]:
    if not raw_nlp_result or not raw_nlp_result.get("sections"):
        return []

    return [
        SectionResult(
            type=section.get("type", "other"),
            text=section.get("text", ""),
            entities=section.get("entities", []),
        )
        for section in raw_nlp_result["sections"]
    ]


def _build_ats_checks(raw_ats_checks: list[dict[str, Any]] | None) -> list[AtsCheck]:
    if not raw_ats_checks:
        return []

    return [
        AtsCheck(
            check=check.get("check", ""),
            status=check.get("status", "pass"),
            detail=check.get("detail", ""),
        )
        for check in raw_ats_checks
    ]


def _build_suggestions(
    raw_suggestions: list[dict[str, Any]] | None,
) -> list[SuggestionCard] | None:
    if raw_suggestions is None:
        return None

    try:
        return [
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
            for card in raw_suggestions
        ]
    except Exception:
        return None


def _build_comparison_result(
    raw_comparison_result: dict[str, Any] | None,
    comparison_status: str | None,
) -> ComparisonResult | None:
    if not raw_comparison_result or comparison_status != "complete":
        return None

    try:
        return ComparisonResult(**raw_comparison_result)
    except Exception:
        return None


def _get_source_text(raw_result: dict[str, Any] | None) -> str | None:
    if not raw_result:
        return None

    text = raw_result.get("text")
    return text if isinstance(text, str) and text else None


def _is_workspace_ready(
    job_status: JobStatus,
    source_text: str | None,
    sections: list[SectionResult],
    analysis: WorkspaceAnalysisContext,
) -> bool:
    if job_status != JobStatus.COMPLETE:
        return False

    has_document = bool(source_text) and bool(sections)
    has_analysis = any(
        (
            analysis.scores is not None,
            bool(analysis.ats_checks),
            analysis.suggestions is not None,
            analysis.comparison_result is not None,
            analysis.comparison_status is not None,
        )
    )
    return has_document and has_analysis


@router.get(
    "/jobs/{job_id}/workspace",
    response_model=WrappedResponse[WorkspaceHydration],
    summary="Get workspace hydration data for a job",
)
async def get_workspace_hydration(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[WorkspaceHydration]:
    """Return a read-only workspace hydration payload keyed by the original job UUID."""
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

        safe_file_metadata = (
            job.file_metadata if isinstance(job.file_metadata, dict) else {}
        )
        safe_result = job.result if isinstance(job.result, dict) else None
        safe_nlp_result = job.nlp_result if isinstance(job.nlp_result, dict) else None
        safe_scores = job.scores if isinstance(job.scores, dict) else None
        safe_ats_checks = job.ats_checks if isinstance(job.ats_checks, list) else None
        safe_suggestions = (
            job.suggestions if isinstance(job.suggestions, list) else None
        )
        safe_comparison_result = (
            job.comparison_result
            if isinstance(job.comparison_result, dict)
            else None
        )
        safe_comparison_status = (
            job.comparison_status if isinstance(job.comparison_status, str) else None
        )

        file_info = WorkspaceFileInfo(
            filename=safe_file_metadata.get("filename"),
            mime_type=safe_file_metadata.get("mime_type"),
            size=safe_file_metadata.get("size"),
            extension=safe_file_metadata.get("extension"),
        )
        source_text = _get_source_text(safe_result)
        sections = _build_sections(safe_nlp_result)
        analysis = WorkspaceAnalysisContext(
            scores=_build_scores(safe_scores),
            ats_checks=_build_ats_checks(safe_ats_checks),
            suggestions=_build_suggestions(safe_suggestions),
            comparison_result=_build_comparison_result(
                safe_comparison_result, safe_comparison_status
            ),
            comparison_status=safe_comparison_status,
        )
        navigation = WorkspaceNavigation(
            workspace_url=f"/workspace/{job.id}",
            results_url=f"/results/{job.id}",
        )

        workspace_status = "preparing"
        if job.status == JobStatus.FAILED:
            workspace_status = "failed"
        elif _is_workspace_ready(job.status, source_text, sections, analysis):
            workspace_status = "ready"

        hydration = WorkspaceHydration(
            job_id=str(job.id),
            status=workspace_status,
            file=file_info,
            document=WorkspaceDocumentPayload(
                source_text=source_text,
                sections=sections,
            ),
            analysis=analysis,
            navigation=navigation,
            error=job.error,
        )

        return WrappedResponse(
            data=hydration,
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(code="WORKSPACE_FETCH_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

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
from app.schemas.anchors import SuggestionAnchorRecord
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.workspace import (
    WorkspaceAnalysisContext,
    WorkspaceContentPatch,
    WorkspaceContentSaveResult,
    WorkspaceDocumentPayload,
    WorkspaceFileInfo,
    WorkspaceFileUrl,
    WorkspaceHydration,
    WorkspaceNavigation,
)
from app.services.storage import StorageError, storage_service


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

    # Deduplicate by type — merge text of duplicate section blocks
    merged: dict[str, str] = {}
    entities_map: dict[str, list] = {}
    for section in raw_nlp_result["sections"]:
        stype = section.get("type", "other")
        text = section.get("text", "")
        entities = section.get("entities", [])
        if stype in merged:
            merged[stype] = merged[stype] + "\n" + text
            entities_map[stype].extend(entities)
        else:
            merged[stype] = text
            entities_map[stype] = list(entities)

    return [
        SectionResult(type=stype, text=text, entities=entities_map[stype])
        for stype, text in merged.items()
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


def _build_suggestion_anchors(
    raw_anchors: list[dict] | None,
) -> list[SuggestionAnchorRecord]:
    """Parse JSONB suggestion_anchors into typed SuggestionAnchorRecord list.
    Returns [] when column is null (e.g., existing jobs pre-Phase 14).
    """
    if not raw_anchors:
        return []
    result = []
    for item in raw_anchors:
        try:
            result.append(SuggestionAnchorRecord.model_validate(item))
        except Exception:
            continue  # Skip malformed entries — graceful degradation
    return result


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
            job.comparison_result if isinstance(job.comparison_result, dict) else None
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

        safe_workspace_draft = (
            job.workspace_draft if isinstance(job.workspace_draft, dict) else None
        )

        safe_suggestion_anchors = (
            job.suggestion_anchors if isinstance(job.suggestion_anchors, list) else None
        )

        hydration = WorkspaceHydration(
            job_id=str(job.id),
            status=workspace_status,
            file=file_info,
            document=WorkspaceDocumentPayload(
                source_text=source_text,
                sections=sections,
                draft_content=(
                    safe_workspace_draft.get("sections")
                    if safe_workspace_draft
                    else None
                ),
            ),
            analysis=analysis,
            navigation=navigation,
            suggestion_anchors=_build_suggestion_anchors(safe_suggestion_anchors),
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


@router.get(
    "/jobs/{job_id}/file",
    response_model=WrappedResponse[WorkspaceFileUrl],
    summary="Dapatkan presigned URL untuk file CV yang diupload",
)
async def get_job_file_url(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[WorkspaceFileUrl]:
    """Return short-lived presigned R2 URL untuk PDF CV asli. (PDF-02)"""
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
                    message=f"Job {job_id} tidak ditemukan.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        if not job.file_id:
            return WrappedResponse(
                error=ErrorDetail(
                    code="FILE_NOT_FOUND",
                    message="File CV tidak tersedia untuk job ini.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        # Generate presigned URL valid 1 jam
        file_url = storage_service.generate_presigned_url(job.file_id, expiration=3600)

        return WrappedResponse(
            data=WorkspaceFileUrl(file_url=file_url, expires_in=3600),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except StorageError as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_URL_FETCH_FAILED",
                message=f"Gagal mendapatkan URL file: {exc!s}",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_URL_FETCH_FAILED",
                message=f"Gagal mendapatkan URL file: {exc!s}",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.patch(
    "/jobs/{job_id}/workspace/content",
    response_model=WrappedResponse[WorkspaceContentSaveResult],
    summary="Save workspace draft content for a job",
)
async def patch_workspace_content(
    job_id: str,
    body: WorkspaceContentPatch,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[WorkspaceContentSaveResult]:
    """Upsert the workspace draft sections (Tiptap JSON) for a job. (D-10, D-11, D-12)"""
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
                    message=f"Job {job_id} not found.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        # Store draft as JSONB — sections keyed by section type
        job.workspace_draft = {"sections": body.sections}
        await db.commit()

        return WrappedResponse(
            data=WorkspaceContentSaveResult(saved=True, updated_at=timestamp),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        await db.rollback()
        return WrappedResponse(
            error=ErrorDetail(code="DRAFT_SAVE_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

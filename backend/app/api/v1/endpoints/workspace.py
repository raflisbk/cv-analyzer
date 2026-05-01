"""Workspace hydration endpoint."""

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, WebSocket
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job, JobStatus
from app.schemas.analysis import (
    AtsCheck,
    ComparisonResult,
    GrammarIssue,
    ScoreResult,
    SectionResult,
    SuggestionCard,
    SuggestionItem,
)
from app.schemas.anchors import SuggestionAnchorRecord
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.inline_edit import InlineEditRequest, InlineEditResponse
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
from app.services.llm.inline_edit_service import InlineEditService
from app.services.pdf_export import PDFExportService
from app.services.pdf_to_html import PDFToHTMLConverter
from app.services.storage import StorageError, storage_service


router = APIRouter()
inline_edit_service = InlineEditService()
pdf_export_service = PDFExportService()


class PDFExportRequest(BaseModel):
    """Request schema for PDF export."""

    html: str = Field(..., description="HTML content from Tiptap editor")
    filename: str = Field(default="cv-optimized.pdf", description="Output filename")


def _build_scores(raw_scores: dict[str, Any] | None) -> ScoreResult | None:
    if not raw_scores:
        return None

    return ScoreResult(
        overall=raw_scores.get("overall", 0),
        clarity=raw_scores.get("clarity", 0),
        impact=raw_scores.get("impact", 0),
        completeness=raw_scores.get("completeness", 0),
        relevance=raw_scores.get("relevance", 0),
        reasonings=raw_scores.get("reasonings", {}),
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


def _build_grammar_issues(
    raw_grammar_issues: list[dict[str, Any]] | None,
) -> list[GrammarIssue]:
    if not raw_grammar_issues:
        return []

    return [
        GrammarIssue(
            text=issue.get("text", ""),
            offset=issue.get("offset", 0),
            suggestion=issue.get("suggestion", ""),
            rule=issue.get("rule", ""),
        )
        for issue in raw_grammar_issues
    ]


def _build_skills(raw_nlp_result: dict[str, Any] | None) -> list[str]:
    if not raw_nlp_result or not raw_nlp_result.get("skills"):
        return []
    return raw_nlp_result.get("skills", [])


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
                        explanation=item.get("explanation", ""),
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
        logger.warning("workspace_suggestions_failed", exc_info=True)
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
        logger.warning("workspace_comparison_failed", exc_info=True)
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
    if not raw_anchors:
        return []
    result = []
    for item in raw_anchors:
        try:
            result.append(SuggestionAnchorRecord.model_validate(item))
        except Exception:
            logger.warning("anchor_validation_skipped", item=str(item)[:80])
            continue
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
            grammar_issues=_build_grammar_issues(
                job.grammar_issues if isinstance(job.grammar_issues, list) else None
            ),
            skills=_build_skills(safe_nlp_result),
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

    except Exception:
        logger.error("workspace_hydration_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(
                code="HYDRATION_FAILED",
                message="Failed to load workspace data.",
            ),
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
        logger.error("file_url_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_URL_FETCH_FAILED",
                message=f"Failed to get file URL: {exc!s}",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.get(
    "/jobs/{job_id}/html",
    response_model=WrappedResponse[dict[str, Any]],
    summary="Get editable HTML structure for Tiptap editor",
)
async def get_job_html(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[dict[str, Any]]:
    """Convert PDF extraction to positioned HTML for Tiptap editor. (PDF-02)"""
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

        # Extract data for conversion
        safe_result = job.result if isinstance(job.result, dict) else {}
        safe_nlp_result = job.nlp_result if isinstance(job.nlp_result, dict) else {}
        safe_anchors = (
            job.suggestion_anchors if isinstance(job.suggestion_anchors, list) else []
        )

        source_text = _get_source_text(safe_result)
        sections = safe_nlp_result.get("sections", [])

        # Get page dimensions from file metadata or use A4 defaults
        safe_file_metadata = (
            job.file_metadata if isinstance(job.file_metadata, dict) else {}
        )
        page_width = safe_file_metadata.get("page_width", 595.5)
        page_height = safe_file_metadata.get("page_height", 842.0)

        # Convert to HTML with positioning
        converter = PDFToHTMLConverter()
        html_result = converter.convert_to_html(
            source_text=source_text or "",
            sections=sections,
            anchors=safe_anchors,
            page_width=page_width,
            page_height=page_height,
        )

        return WrappedResponse(
            data=html_result,
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception:
        logger.error("html_conversion_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(
                code="HTML_CONVERSION_FAILED",
                message="Failed to convert CV to HTML.",
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
    """Upsert the workspace draft sections (Tiptap JSON) for a job."""
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

    except Exception:
        await db.rollback()
        logger.error("draft_save_failed", job_id=job_id, exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(
                code="DRAFT_SAVE_FAILED",
                message="Failed to save draft content.",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.post(
    "/ai/improve",
    response_model=WrappedResponse[InlineEditResponse],
    summary="Improve CV text with AI",
)
async def improve_text(
    body: InlineEditRequest,
) -> WrappedResponse[InlineEditResponse]:
    """Generate AI rewrite for selected CV text."""
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        result = inline_edit_service.rewrite(
            selected_text=body.selectedText,
            prompt=body.prompt,
            cv_context=body.cvContext,
        )

        return WrappedResponse(
            data=result,
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception:
        logger.error("ai_improve_failed", exc_info=True)
        return WrappedResponse(
            error=ErrorDetail(
                code="AI_IMPROVE_FAILED",
                message="Failed to generate AI rewrite.",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.post(
    "/export/pdf",
    summary="Export editor HTML to PDF",
)
async def export_pdf(body: PDFExportRequest) -> Response:
    """Convert Tiptap editor HTML to formatted PDF."""
    try:
        pdf_bytes = pdf_export_service.export_html_to_pdf(
            html_content=body.html,
            metadata={"title": body.filename.replace(".pdf", "")},
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{body.filename}"',
            },
        )

    except Exception:
        logger.error("pdf_export_failed", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=WrappedResponse(
                error=ErrorDetail(
                    code="PDF_EXPORT_FAILED",
                    message="PDF export failed.",
                ),
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            ).model_dump(),
        )


# WebSocket route for Yjs real-time sync
@router.websocket("/yws/{document_id}")
async def yjs_websocket(websocket: WebSocket, document_id: str) -> None:
    """WebSocket endpoint for Yjs CRDT sync."""
    from app.api.v1.websocket.yws_handler import yjs_websocket_endpoint

    await yjs_websocket_endpoint(websocket, document_id)

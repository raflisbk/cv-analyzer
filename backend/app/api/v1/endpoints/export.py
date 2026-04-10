"""
PDF export endpoint per D-C11, EXPORT-01, EXPORT-03.
GET /jobs/{id}/export/pdf — streams WeasyPrint-rendered PDF of full analysis.
Uses Jinja2 template: app/templates/cv_analysis_report.html
"""

import asyncio
import io
import uuid
from datetime import UTC, datetime
from functools import partial
from pathlib import Path

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, Response, StreamingResponse
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from weasyprint import HTML

from app.core.logging import mask_pii
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse


router = APIRouter()

# Jinja2 env — resolve deterministically to backend/app/templates regardless of CWD
_TEMPLATE_DIR = Path(__file__).resolve().parents[3] / "templates"
_jinja_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)))


@router.get(
    "/jobs/{job_id}/export/pdf",
    summary="Export CV analysis as PDF",
    response_class=Response,
)
async def export_pdf(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> Response:
    """
    Generate and stream PDF of CV analysis per D-C11, EXPORT-01, EXPORT-03.

    Renders all available analysis data (scores, skills, grammar, ATS, suggestions,
    comparison if present) into cv_analysis_report.html template via WeasyPrint.
    Streams PDF as attachment with filename cv-analysis-{job_id[:8]}.pdf.

    Note: WeasyPrint.write_pdf() is synchronous (CPU-bound); for production scaling
    use run_in_executor. For portfolio purposes direct call is acceptable.
    """
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            error_response = WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND",
                    message=f"Job {job_id} not found.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )
            return JSONResponse(status_code=404, content=error_response.model_dump())

        # Build template context from job JSONB columns
        template_context = {
            "job_id": str(job.id),
            "generated_at": datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC"),
            "filename": (job.file_metadata or {}).get("filename", "CV"),
            "scores": job.scores,
            "sections": (job.nlp_result or {}).get("sections", []),
            "skills": (job.nlp_result or {}).get("skills", []),
            "grammar_issues": job.grammar_issues or [],
            "ats_checks": job.ats_checks or [],
            "suggestions": job.suggestions or [],
            "comparison_result": job.comparison_result,
            "comparison_status": job.comparison_status,
        }

        try:
            template = _jinja_env.get_template("cv_analysis_report.html")
            html_content = template.render(**template_context)

            # WeasyPrint is synchronous/CPU-bound; run in thread executor
            # to avoid blocking the async event loop.
            loop = asyncio.get_running_loop()
            pdf_bytes = await loop.run_in_executor(
                None, partial(HTML(string=html_content).write_pdf)
            )
        except Exception:
            logger.exception(mask_pii(f"PDF export render failed for job {job_id}"))
            error_response = WrappedResponse(
                error=ErrorDetail(
                    code="PDF_EXPORT_FAILED",
                    message="PDF generation failed. Please try again later.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )
            return JSONResponse(status_code=500, content=error_response.model_dump())

        logger.info(
            "PDF export generated",
            extra={"job_id": job_id, "pdf_bytes": len(pdf_bytes)},
        )

        # Build export filename: strip extension from original CV filename,
        # sanitize, then append short job ID. e.g. "John_Doe_CV-a1b2c3d4.pdf"
        original_name = (job.file_metadata or {}).get("filename", "")
        base_name = Path(original_name).stem  # drop .pdf/.docx
        # Keep only alphanumerics, spaces, hyphens, underscores; replace spaces → _
        safe_prefix = "".join(c if c.isalnum() or c in "-_" else "_" for c in base_name).strip("_")
        export_filename = f"cv-analyze-{safe_prefix}-{str(job.id)[:8]}.pdf" if safe_prefix else f"cv-analyze-{str(job.id)[:8]}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{export_filename}"'
            },
        )

    except Exception:
        logger.exception(mask_pii(f"PDF export failed for job {job_id}"))
        error_response = WrappedResponse(
            error=ErrorDetail(
                code="EXPORT_FETCH_FAILED",
                message="Unable to export PDF at this time.",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
        return JSONResponse(status_code=500, content=error_response.model_dump())

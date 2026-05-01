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

from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse

router = APIRouter()


_TEMPLATE_DIR = Path(__file__).resolve().parents[3] / "templates"
_jinja_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)))


@router.post(
    "/jobs/{job_id}/export/optimized",
    summary="Export optimized CV as PDF",
    response_class=Response,
)
async def export_optimized_cv(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> Response:
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

        cv_document = job.cv_document or {}
        template_context = {
            "cv_document": cv_document,
            "scores": cv_document.get("scores", job.scores),
            "filename": (job.file_metadata or {}).get("filename", "CV"),
            "job_id": str(job.id),
            "generated_at": datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC"),
        }

        try:
            template = _jinja_env.get_template("cv_optimized.html")
            html_content = template.render(**template_context)

            loop = asyncio.get_running_loop()
            pdf_bytes = await loop.run_in_executor(
                None, partial(HTML(string=html_content).write_pdf)
            )
        except Exception:
            logger.exception("optimized_cv_render_failed", job_id=job_id)
            error_response = WrappedResponse(
                error=ErrorDetail(
                    code="PDF_EXPORT_FAILED",
                    message="PDF generation failed. Please try again later.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )
            return JSONResponse(status_code=500, content=error_response.model_dump())

        logger.info(
            "Optimized CV export generated",
            job_id=job_id,
            pdf_bytes=len(pdf_bytes),
        )

        original_name = (job.file_metadata or {}).get("filename", "")
        base_name = Path(original_name).stem

        safe_prefix = "".join(
            c if c.isalnum() or c in "-_" else "_" for c in base_name
        ).strip("_")
        export_filename = (
            f"cv-optimized-{safe_prefix}-{str(job.id)[:8]}.pdf"
            if safe_prefix
            else f"cv-optimized-{str(job.id)[:8]}.pdf"
        )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{export_filename}"'
            },
        )

    except Exception:
        logger.exception("optimized_cv_export_failed", job_id=job_id)
        error_response = WrappedResponse(
            error=ErrorDetail(
                code="EXPORT_FETCH_FAILED",
                message="Unable to export PDF at this time.",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
        return JSONResponse(status_code=500, content=error_response.model_dump())


@router.get(
    "/jobs/{job_id}/export/pdf",
    summary="Export CV analysis as PDF",
    response_class=Response,
)
async def export_pdf(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> Response:
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
            "cv_document": job.cv_document or {},
            "messages": job.messages or [],
        }

        try:
            template = _jinja_env.get_template("cv_analysis_report.html")
            html_content = template.render(**template_context)

            loop = asyncio.get_running_loop()
            pdf_bytes = await loop.run_in_executor(
                None, partial(HTML(string=html_content).write_pdf)
            )
        except Exception:
            logger.exception("pdf_export_render_failed", job_id=job_id)
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
            job_id=job_id,
            pdf_bytes=len(pdf_bytes),
        )

        original_name = (job.file_metadata or {}).get("filename", "")
        base_name = Path(original_name).stem

        safe_prefix = "".join(
            c if c.isalnum() or c in "-_" else "_" for c in base_name
        ).strip("_")
        export_filename = (
            f"cv-analyze-{safe_prefix}-{str(job.id)[:8]}.pdf"
            if safe_prefix
            else f"cv-analyze-{str(job.id)[:8]}.pdf"
        )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{export_filename}"'
            },
        )

    except Exception:
        logger.exception("pdf_export_failed", job_id=job_id)
        error_response = WrappedResponse(
            error=ErrorDetail(
                code="EXPORT_FETCH_FAILED",
                message="Unable to export PDF at this time.",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
        return JSONResponse(status_code=500, content=error_response.model_dump())

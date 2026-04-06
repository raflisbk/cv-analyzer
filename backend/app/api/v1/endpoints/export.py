"""
PDF export endpoint per D-C11, EXPORT-01, EXPORT-03.
GET /jobs/{id}/export/pdf — streams WeasyPrint-rendered PDF of full analysis.
Uses Jinja2 template: app/templates/cv_analysis_report.html
"""

import io
import uuid
from datetime import UTC, datetime
from pathlib import Path

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from weasyprint import HTML

from app.core.logging import mask_pii
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse


router = APIRouter()

# Jinja2 env — FileSystemLoader relative to backend/ working directory
# Path resolves to backend/app/templates/ regardless of CWD
_TEMPLATE_DIR = Path(__file__).parent.parent.parent.parent / "app" / "templates"
_jinja_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)))


@router.get(
    "/jobs/{job_id}/export/pdf",
    summary="Export CV analysis as PDF",
    response_class=StreamingResponse,
)
async def export_pdf(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """
    Generate and stream PDF of CV analysis per D-C11, EXPORT-01, EXPORT-03.

    Renders all available analysis data (scores, skills, grammar, ATS, suggestions,
    comparison if present) into cv_analysis_report.html template via WeasyPrint.
    Streams PDF as attachment with filename cv-analysis-{job_id[:8]}.pdf.

    Note: WeasyPrint.write_pdf() is synchronous (CPU-bound); for production scaling
    use run_in_executor. For portfolio purposes direct call is acceptable.
    """
    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            # Return JSON error (not PDF) when job not found
            return WrappedResponse(  # type: ignore[return-value]
                error=ErrorDetail(
                    code="JOB_NOT_FOUND",
                    message=f"Job {job_id} not found.",
                ),
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            )

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

        template = _jinja_env.get_template("cv_analysis_report.html")
        html_content = template.render(**template_context)

        # WeasyPrint renders HTML → PDF bytes in memory
        pdf_bytes = HTML(string=html_content).write_pdf()

        logger.info(
            "PDF export generated",
            extra={"job_id": job_id, "pdf_bytes": len(pdf_bytes)},
        )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=cv-analysis-{str(job.id)[:8]}.pdf"
            },
        )

    except Exception as e:
        logger.error(mask_pii(f"PDF export failed for job {job_id}: {e}"))
        # Return streaming error response — no raw exception in user-facing content per D-C15/W-4
        error_html = "<html><body><p>Export failed. Please try again.</p></body></html>"
        error_pdf = HTML(string=error_html).write_pdf()
        return StreamingResponse(
            io.BytesIO(error_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=cv-analysis-error.pdf"
            },
        )

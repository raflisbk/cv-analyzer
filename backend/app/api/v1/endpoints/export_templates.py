import asyncio
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select

from app.api.dependencies import require_user
from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.common import WrappedResponse
from app.schemas.export_templates import ExportRequest, ExportTemplate
from app.services.export_templates.apply_fixes import FixResult, apply_fixes
from app.services.export_templates.html_pdf import extract_pdf_text, render_pdf
from app.services.export_templates.original_docx import render_original_docx
from app.services.export_templates.original_pdf import render_original_pdf
from app.services.export_templates.registry import (
    known_template,
    score_original,
    template_list,
)
from app.services.storage import storage_service

router = APIRouter()
_DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


async def _owner_job(db: AsyncSession, user: User, job_id: str) -> Job:
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    )
    job = result.scalar_one_or_none()
    if job is None or str(job.user_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


def _file_type(job: Job) -> str:
    metadata = job.file_metadata or {}
    return Path(metadata.get("filename") or "").suffix.lower()


def _filename(job: Job, template_id: str, extension: str) -> str:
    source = Path((job.file_metadata or {}).get("filename") or "CV").stem
    stem = re.sub(r"[^A-Za-z0-9_-]", "_", source).strip("_")[:80] or "CV"
    return f"{stem}-{template_id}{extension}"


async def _original_output(job: Job, file_type: str, result: FixResult) -> bytes:
    data = await asyncio.to_thread(storage_service.get_file, job.file_id)
    if file_type == ".pdf":
        if not (await asyncio.to_thread(extract_pdf_text, data)).strip():
            raise HTTPException(
                status_code=422,
                detail="Your original needs a text-based PDF or DOCX upload.",
            )
        return await asyncio.to_thread(render_original_pdf, data, result)
    return await asyncio.to_thread(render_original_docx, data, result)


@router.get(
    "/export/templates",
    response_model=WrappedResponse[list[ExportTemplate]],
    response_model_by_alias=True,
)
async def get_export_templates(
    job_id: str | None = Query(default=None, alias="jobId"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> WrappedResponse[list[ExportTemplate]]:
    score = None
    if job_id:
        job = await _owner_job(db, user, job_id)
        data = await asyncio.to_thread(storage_service.get_file, job.file_id)
        score = await asyncio.to_thread(score_original, data, _file_type(job))
    entries = await asyncio.to_thread(template_list, score)
    return WrappedResponse(
        data=[ExportTemplate.model_validate(entry) for entry in entries]
    )


@router.post("/jobs/{job_id}/export", response_class=Response)
async def export_job(
    job_id: str,
    body: ExportRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> Response:
    if not known_template(body.template_id):
        raise HTTPException(status_code=404, detail="Template not found.")
    job = await _owner_job(db, user, job_id)
    file_type = _file_type(job)
    if body.template_id == "original" and file_type not in (".pdf", ".docx"):
        raise HTTPException(
            status_code=422,
            detail="Your original needs a text-based PDF or DOCX upload.",
        )
    result = apply_fixes(
        job.cv_document or {},
        job.suggestions or [],
        body.fix_ids,
        body.answers,
        original=body.template_id == "original",
    )
    if body.template_id == "original":
        output = await _original_output(job, file_type, result)
    else:
        output = await asyncio.to_thread(render_pdf, body.template_id, result.document)
    extension = (
        ".docx" if body.template_id == "original" and file_type == ".docx" else ".pdf"
    )
    media_type = _DOCX_TYPE if extension == ".docx" else "application/pdf"
    return Response(
        content=output,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{_filename(job, body.template_id, extension)}"',
            "X-Export-Applied": str(len(result.applied)),
            "X-Export-Skipped": str(len(result.skipped)),
            "Access-Control-Expose-Headers": "X-Export-Applied, X-Export-Skipped, Content-Disposition",
        },
    )

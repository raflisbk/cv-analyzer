"""Job status endpoint"""

import uuid
from datetime import UTC, datetime
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.db.session import AsyncSession, get_db
from app.models.job import Job
from app.schemas.common import ErrorDetail, ResponseMeta, WrappedResponse
from app.schemas.job import JobResponse
from app.schemas.workspace import WorkspaceFileUrl
from app.services.storage import StorageError, storage_service


router = APIRouter()


@router.get("/jobs/{job_id}", response_model=WrappedResponse[JobResponse])
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get job status and results."""
    request_id = str(uuid.uuid4())

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND", message=f"Job {job_id} not found"
                ),
                meta=ResponseMeta(
                    request_id=request_id, timestamp=datetime.now(UTC).isoformat()
                ),
            )

        return WrappedResponse(
            data=JobResponse.model_validate(job),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )

    except Exception as e:
        return WrappedResponse(
            error=ErrorDetail(code="QUERY_FAILED", message=str(e)),
            meta=ResponseMeta(
                request_id=request_id, timestamp=datetime.now(UTC).isoformat()
            ),
        )


@router.get(
    "/jobs/{job_id}/file",
    response_model=WrappedResponse[WorkspaceFileUrl],
    summary="Get presigned URL for uploaded CV file",
    tags=["jobs"],
)
async def get_job_file_url(
    job_id: str,
    db: AsyncSession = Depends(get_db),
) -> WrappedResponse[WorkspaceFileUrl]:
    """Return short-lived presigned R2 URL for original uploaded PDF. (PDF-02)"""
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

        if not job.file_id:
            return WrappedResponse(
                error=ErrorDetail(
                    code="FILE_NOT_FOUND",
                    message="CV file not available for this job.",
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        file_url = storage_service.generate_presigned_url(job.file_id, expiration=3600)

        return WrappedResponse(
            data=WorkspaceFileUrl(file_url=file_url, expires_in=3600),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except StorageError as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_URL_FETCH_FAILED",
                message=f"Failed to get file URL: {exc!s}",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )
    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_URL_FETCH_FAILED",
                message=f"Failed to get file URL: {exc!s}",
            ),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


@router.get(
    "/jobs/{job_id}/file/proxy",
    summary="Stream PDF file directly (avoids CORS issues)",
    tags=["jobs"],
)
async def proxy_job_file(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Stream PDF file directly from R2 to avoid CORS issues with react-pdf.
    Returns StreamingResponse with proper Content-Type for PDF rendering.
    """
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
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            )

        if not job.file_id:
            return WrappedResponse(
                error=ErrorDetail(
                    code="FILE_NOT_FOUND",
                    message="CV file not available for this job.",
                ),
                meta=ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now(UTC).isoformat(),
                ),
            )

        # Get file content from R2
        file_content = storage_service.get_file(job.file_id)

        # Stream as PDF with proper headers
        return StreamingResponse(
            BytesIO(file_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{job.file_id}"',
                "Cache-Control": "public, max-age=3600",
            },
        )

    except StorageError as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_FETCH_FAILED",
                message=f"Failed to fetch file: {exc!s}",
            ),
            meta=ResponseMeta(
                request_id=str(uuid.uuid4()), timestamp=datetime.now(UTC).isoformat()
            ),
        )
    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(
                code="FILE_FETCH_FAILED",
                message=f"Failed to fetch file: {exc!s}",
            ),
            meta=ResponseMeta(
                request_id=str(uuid.uuid4()), timestamp=datetime.now(UTC).isoformat()
            ),
        )


# ── HTML content endpoint ─────────────────────────────────────────────────────

import html as _html_lib  # noqa: E402
import re as _re  # noqa: E402


_SECTION_LABELS: dict[str, str] = {
    "header": "Contact Information",
    "summary": "Professional Summary",
    "objective": "Objective",
    "experience": "Work Experience",
    "education": "Education & Certification",
    "skills": "Skills",
    "certifications": "Certifications",
    "awards": "Awards & Recognition",
    "projects": "Projects",
    "languages": "Languages",
    "publications": "Publications",
    "volunteer": "Volunteer Experience",
    "references": "References",
    "challenges": "Challenges",
    "tasks": "Tasks",
}


def _section_label(stype: str) -> str:
    return _SECTION_LABELS.get(stype.lower(), stype.replace("_", " ").title())


def _is_caps_header(line: str) -> bool:
    """Return True if line looks like an ALL-CAPS CV section title."""
    s = line.strip()
    return bool(s and 3 <= len(s) <= 80 and s == s.upper() and _re.search(r"[A-Z]", s))


def _text_to_html_body(text: str, first_line_as_h1: bool = False) -> str:
    """Convert plain CV section text to HTML.
    ALL-CAPS lines → <h2>, first line → <h1> if first_line_as_h1."""
    lines = text.split("\n")
    parts: list[str] = []
    i = 0
    is_first = True
    while i < len(lines):
        raw = lines[i].strip()
        i += 1
        if not raw:
            continue

        # First line of header section → H1 (candidate name)
        if is_first and first_line_as_h1:
            parts.append(f"<h1>{_html_lib.escape(raw)}</h1>")
            is_first = False
            continue
        is_first = False

        # ALL-CAPS line → H2 (actual section title inside the PDF text)
        if _is_caps_header(raw):
            parts.append(f"<h2>{_html_lib.escape(raw)}</h2>")
            continue

        # Explicit bullet markers
        bm = _re.match(r"^[•·▪▸–\-\*→]\s+(.*)", raw)
        if bm:
            items = [_html_lib.escape(bm.group(1))]
            while i < len(lines):
                nxt = lines[i].strip()
                nm = _re.match(r"^[•·▪▸–\-\*→]\s+(.*)", nxt)
                if nm:
                    items.append(_html_lib.escape(nm.group(1)))
                    i += 1
                elif not nxt:
                    i += 1
                    break
                else:
                    break
            parts.append("<ul>" + "".join(f"<li>{t}</li>" for t in items) + "</ul>")
            continue

        # "Role | Company [Date]"
        pipe_idx = raw.find(" | ")
        if 2 <= pipe_idx <= 70 and "@" not in raw and not raw.startswith("http"):
            title = _html_lib.escape(raw[:pipe_idx])
            rest = _html_lib.escape(raw[pipe_idx + 3 :])
            parts.append(f"<p><strong>{title}</strong> | {rest}</p>")
            continue

        # "Key: Description"
        cm = _re.match(r"^([A-Z][^:]{2,54}):\s+(.+)", raw)
        if cm:
            key = _html_lib.escape(cm.group(1))
            desc = _html_lib.escape(cm.group(2))
            parts.append(f"<p><strong>{key}:</strong> {desc}</p>")
            continue

        parts.append(f"<p>{_html_lib.escape(raw)}</p>")

    return "\n".join(parts)


def _sections_to_html(sections: list[dict]) -> str:
    """Render sections WITHOUT NLP type labels as headings (NLP types unreliable).
    First 'header' section first line → H1 (name). ALL-CAPS lines → H2."""
    parts: list[str] = []
    is_first_section = True
    for sec in sections:
        stype = (sec.get("type") or "").lower()
        text = (sec.get("text") or "").strip()
        if not text:
            continue
        use_h1 = is_first_section and stype == "header"
        body = _text_to_html_body(text, first_line_as_h1=use_h1)
        parts.append(f'<div data-section="{stype}">{body}</div>')
        is_first_section = False
    return "\n".join(parts)


@router.get(
    "/jobs/{job_id}/html",
    summary="Get CV sections as structured HTML for the rich-text editor",
    tags=["jobs"],
)
async def get_job_html(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Convert extracted nlp_result sections into styled HTML for workspace-v2 RichTextEditor."""
    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND", message=f"Job {job_id} not found."
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        html_content = ""
        nlp = job.nlp_result or {}
        sections: list[dict] = nlp.get("sections", [])

        if sections:
            html_content = _sections_to_html(sections)
        else:
            source = nlp.get("source_text", "") or ""
            if source:
                html_content = "\n".join(
                    f"<p>{_html_lib.escape(ln)}</p>"
                    for ln in source.split("\n")
                    if ln.strip()
                )

        if not html_content:
            html_content = "<p>No content available. Please re-upload the CV.</p>"

        return WrappedResponse(
            data={"html": html_content},
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(code="HTML_GENERATION_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )


from pydantic import BaseModel


class InlineEditRequest(BaseModel):
    selectedText: str
    prompt: str
    cvContext: dict | None = None


@router.post(
    "/jobs/{job_id}/inline-edit",
    summary="Generate AI rewrite for a specific text snippet",
    tags=["jobs"],
)
async def generate_inline_rewrite(
    job_id: str,
    request: InlineEditRequest,
    db: AsyncSession = Depends(get_db),
):
    """Rewrite a specific snippet of text from the CV based on user prompt."""
    from app.services.llm.hf_llm_service import HFLLMService

    request_id = str(uuid.uuid4())
    timestamp = datetime.now(UTC).isoformat()

    try:
        # Validate job exists
        stmt = select(Job).where(Job.id == job_id)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            return WrappedResponse(
                error=ErrorDetail(
                    code="JOB_NOT_FOUND", message=f"Job {job_id} not found."
                ),
                meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
            )

        llm = HFLLMService()
        result = llm.inline_rewrite(
            text=request.selectedText, prompt=request.prompt, context=request.cvContext
        )

        return WrappedResponse(
            data={"rewrittenText": result["rewritten_text"]},
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

    except Exception as exc:
        return WrappedResponse(
            error=ErrorDetail(code="INLINE_EDIT_FAILED", message=str(exc)),
            meta=ResponseMeta(request_id=request_id, timestamp=timestamp),
        )

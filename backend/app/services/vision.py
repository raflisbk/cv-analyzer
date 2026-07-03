"""Granite Vision 4.1 4B via Replicate — text extraction from images and scanned PDFs."""

import base64

from app.core.logging import structured_logger as logger

_EXTRACTION_PROMPT = """\
Extract ALL text from this CV/resume image. Preserve the structure exactly:
- Keep section headings (e.g., EXPERIENCE, EDUCATION, SKILLS, SUMMARY)
- Keep bullet points and their content
- Keep dates, contact info, company names, and all other text
- Output ONLY the extracted text, no commentary or explanation
"""

try:
    import replicate  # noqa: F401

    VISION_AVAILABLE = True
except ImportError:
    VISION_AVAILABLE = False


def _image_to_data_uri(image_bytes: bytes, mime_type: str) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{b64}"


def extract_text_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Extract text from a single image using Granite Vision 4.1 4B on Replicate."""
    if not VISION_AVAILABLE:
        msg = "replicate package not installed — run: pip install replicate"
        raise RuntimeError(msg)

    from app.core.config import get_settings

    settings = get_settings()
    if not settings.CV_ANALYZER_REPLICATE_API_TOKEN:
        msg = "CV_ANALYZER_REPLICATE_API_TOKEN not configured"
        raise RuntimeError(msg)

    import replicate

    client = replicate.Client(api_token=settings.CV_ANALYZER_REPLICATE_API_TOKEN)
    data_uri = _image_to_data_uri(image_bytes, mime_type)

    output = client.run(
        "ibm-granite/granite-vision-4.1-4b",
        input={
            "image": data_uri,
            "prompt": _EXTRACTION_PROMPT,
            "max_new_tokens": 2048,
            "temperature": 0.1,
        },
    )

    # output is a generator of string chunks
    if hasattr(output, "__iter__") and not isinstance(output, str):
        result = "".join(output)
    else:
        result = str(output)

    logger.info("vision_extraction_done", chars=len(result))
    return result.strip()


def extract_text_from_scanned_pdf(pdf_bytes: bytes) -> str:
    """Convert PDF pages to images and extract text via Granite Vision.

    Used as a fallback when PyMuPDF text extraction yields low-quality output
    (scanned/image-only PDFs).
    """
    try:
        import fitz
    except ImportError as e:
        msg = "PyMuPDF not installed"
        raise RuntimeError(msg) from e

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text: list[str] = []

    for page_num, page in enumerate(doc):
        try:
            # 2x resolution for better OCR accuracy
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("jpeg")

            page_text = extract_text_from_image(img_bytes, "image/jpeg")
            if page_text.strip():
                pages_text.append(page_text)

            logger.info("vision_page_done", page=page_num + 1, chars=len(page_text))

        except Exception as e:
            logger.warning("vision_page_failed", page=page_num + 1, error=str(e))
            continue

    doc.close()

    if not pages_text:
        msg = "Granite Vision extracted no text from PDF pages"
        raise RuntimeError(msg)

    return "\n\n".join(pages_text)

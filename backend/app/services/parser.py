"""
Document parsing orchestrator
Implements UPLOAD-03: Text extraction with quality validation
Implements UPLOAD-04: OCR fallback for scanned PDFs
Implements UPLOAD-05: International CV format handling
Implements UPLOAD-06: Quality validation and error reporting
"""

from io import BytesIO


try:
    import fitz  # PyMuPDF

    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    from docx import Document

    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import langdetect

    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False

from app.core.logging import structured_logger as logger
from app.services.ocr import EASYOCR_AVAILABLE, perform_ocr
from app.services.validation import validate_extraction_quality


class ParsingError(Exception):
    """Raised when document parsing fails after all retries"""


class DocumentParser:
    """
    Document parsing orchestrator with fallback strategies per D-08, D-10
    """

    def parse_pdf(self, content: bytes) -> tuple[str, dict]:
        """
        Parse PDF with OCR fallback per D-08

        Strategy:
        1. Try regular text extraction first
        2. If insufficient (<50 chars), try OCR
        3. Validate quality
        4. Retry with different approaches if needed (per D-10)

        Args:
            content: PDF file bytes

        Returns:
            tuple of (extracted_text, metadata_dict)

        Raises:
            ParsingError: If all extraction methods fail
        """
        if not PYMUPDF_AVAILABLE:
            msg = "PyMuPDF not installed. Install with: pip install PyMuPDF"
            raise ParsingError(msg)

        metadata = {
            "extraction_method": None,
            "quality_score": 0.0,
            "page_count": 0,
            "detected_language": None,
        }

        # Attempt 1: Regular text extraction
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            metadata["page_count"] = len(doc)

            text = ""
            for page in doc:
                text += page.get_text()

            doc.close()

            logger.info(
                "PDF text extraction complete",
                extra={"length": len(text), "pages": metadata["page_count"]},
            )

            # Check if extraction sufficient
            if len(text.strip()) >= 50:
                quality_score, _ = validate_extraction_quality(text)
                metadata["extraction_method"] = "text_extraction"
                metadata["quality_score"] = quality_score

                if quality_score >= 0.5:
                    # Good quality, detect language per D-11
                    if LANGDETECT_AVAILABLE:
                        try:
                            metadata["detected_language"] = langdetect.detect(text)
                        except Exception:
                            metadata["detected_language"] = "unknown"
                    else:
                        metadata["detected_language"] = "unknown"

                    return text, metadata

            logger.warning(
                "Regular extraction insufficient, trying OCR",
                extra={"text_length": len(text)},
            )

        except Exception as e:
            logger.warning("Regular PDF extraction failed", extra={"error": str(e)})

        # Attempt 2: OCR fallback per D-08
        if EASYOCR_AVAILABLE:
            try:
                logger.info("Starting OCR fallback")
                text, confidence = perform_ocr(content)

                if len(text.strip()) >= 50:
                    quality_score, _ = validate_extraction_quality(text)
                    metadata["extraction_method"] = "ocr"
                    metadata["quality_score"] = quality_score
                    metadata["ocr_confidence"] = confidence

                    if quality_score >= 0.4:  # Lower threshold for OCR
                        if LANGDETECT_AVAILABLE:
                            try:
                                metadata["detected_language"] = langdetect.detect(text)
                            except Exception:
                                metadata["detected_language"] = "unknown"
                        else:
                            metadata["detected_language"] = "unknown"

                        return text, metadata

                logger.error(
                    "OCR extraction insufficient",
                    extra={"text_length": len(text), "confidence": confidence},
                )

            except Exception as e:
                logger.error("OCR extraction failed", extra={"error": str(e)})
        else:
            logger.warning("OCR fallback skipped - EasyOCR not available")

        # All methods failed
        msg = (
            "Failed to extract text from PDF after trying regular extraction and OCR. "
            "File may be corrupted, password-protected, or contain only images."
        )
        raise ParsingError(msg)

    def parse_docx(self, content: bytes) -> tuple[str, dict]:
        """
        Parse DOCX file

        Args:
            content: DOCX file bytes

        Returns:
            tuple of (extracted_text, metadata_dict)

        Raises:
            ParsingError: If extraction fails
        """
        if not DOCX_AVAILABLE:
            msg = "python-docx not installed. Install with: pip install python-docx"
            raise ParsingError(msg)

        metadata = {
            "extraction_method": "docx",
            "quality_score": 0.0,
            "detected_language": None,
        }

        try:
            # python-docx requires file-like object
            doc = Document(BytesIO(content))

            # Extract text from paragraphs
            text = "\n".join([para.text for para in doc.paragraphs])

            logger.info(
                "DOCX extraction complete",
                extra={"length": len(text), "paragraphs": len(doc.paragraphs)},
            )

            if len(text.strip()) < 50:
                msg = "DOCX extraction yielded insufficient text (< 50 characters)"
                raise ParsingError(msg)

            # Validate quality
            quality_score, _ = validate_extraction_quality(text)
            metadata["quality_score"] = quality_score

            if quality_score < 0.3:
                msg = f"Low quality DOCX extraction (score: {quality_score})"
                raise ParsingError(msg)

            # Detect language per D-11
            if LANGDETECT_AVAILABLE:
                try:
                    metadata["detected_language"] = langdetect.detect(text)
                except Exception:
                    metadata["detected_language"] = "unknown"
            else:
                metadata["detected_language"] = "unknown"

            return text, metadata

        except ParsingError:
            raise
        except Exception as e:
            logger.error("DOCX extraction failed", extra={"error": str(e)})
            msg = f"Failed to extract text from DOCX: {e!s}"
            raise ParsingError(msg) from e


def parse_document(content: bytes, file_type: str) -> tuple[str, dict]:
    """
    Module-level parse function per RESEARCH.md patterns

    Args:
        content: File content bytes
        file_type: File extension (.pdf, .docx, .doc)

    Returns:
        tuple of (extracted_text, metadata_dict)

    Raises:
        ParsingError: If parsing fails
    """
    parser = DocumentParser()

    if file_type.lower() in [".pdf"]:
        return parser.parse_pdf(content)
    if file_type.lower() in [".docx", ".doc"]:
        return parser.parse_docx(content)
    msg = f"Unsupported file type: {file_type}"
    raise ParsingError(msg)

from pathlib import Path

import magic

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",  # DOCX files are detected as ZIP (they are ZIP archives)
}
MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1": "application/msword",  # DOC
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX (ZIP)
}


class FileValidationError(Exception):
    """Raised when file validation fails"""

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


async def validate_file(filename: str, content: bytes) -> dict:
    """
    Triple-check file validation per D-28: extension, MIME type, magic bytes.
    Implements ERROR-01 requirement.

    Args:
        filename: Original filename
        content: File content bytes

    Returns:
        dict with validated file info

    Raises:
        FileValidationError: If validation fails
    """
    # Check 1: File extension
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        logger.warning(
            "Invalid file extension",
            extra={"filename": filename, "extension": file_ext},
        )
        raise FileValidationError(
            code="INVALID_FILE_TYPE",
            message="File type not supported. Only PDF, DOC, and DOCX files are allowed.",
        )

    # Check 2: File size per D-02 (5MB limit)
    file_size = len(content)
    if file_size > settings.CV_ANALYZER_MAX_FILE_SIZE:
        logger.warning(
            "File size exceeds limit", extra={"filename": filename, "size": file_size}
        )
        raise FileValidationError(
            code="FILE_TOO_LARGE",
            message=f"File size exceeds {settings.CV_ANALYZER_MAX_FILE_SIZE // (1024*1024)}MB limit.",
        )

    # Check 3: MIME type detection
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        logger.warning("Invalid MIME type", extra={"filename": filename, "mime": mime})
        raise FileValidationError(
            code="INVALID_MIME_TYPE",
            message=f"File MIME type {mime} not allowed. File may be corrupted or mislabeled.",
        )

    # Check 4: Magic bytes validation
    magic_byte_valid = False
    for magic_prefix, expected_mime in MAGIC_BYTES.items():
        if content.startswith(magic_prefix) and (
            mime == expected_mime
            or (magic_prefix == b"PK\x03\x04" and mime == "application/zip")
        ):
            magic_byte_valid = True
            break

    if not magic_byte_valid:
        logger.warning(
            "Magic bytes validation failed", extra={"filename": filename, "mime": mime}
        )
        raise FileValidationError(
            code="INVALID_FILE_STRUCTURE",
            message="File structure validation failed. File may be corrupted.",
        )

    logger.info(
        "File validation successful",
        extra={"filename": filename, "size": file_size, "mime": mime},
    )

    return {
        "filename": filename,
        "size": file_size,
        "mime_type": mime,
        "extension": file_ext,
    }

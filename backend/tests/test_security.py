import pytest

from app.core.security import FileValidationError, validate_file


@pytest.mark.asyncio
async def test_validate_pdf_success():
    """Test valid PDF file passes validation"""
    # Minimal valid PDF header
    content = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    result = await validate_file("test.pdf", content)
    assert result["extension"] == ".pdf"
    assert result["mime_type"] == "application/pdf"
    assert result["filename"] == "test.pdf"
    assert result["size"] == len(content)


@pytest.mark.asyncio
async def test_validate_file_too_large():
    """Test file size limit per D-02 (5MB)"""
    # Create a 6MB file (exceeds 5MB limit)
    large_content = b"%PDF-1.4\n" + (b"0" * (6 * 1024 * 1024))
    with pytest.raises(FileValidationError) as exc:
        await validate_file("large.pdf", large_content)
    assert exc.value.code == "FILE_TOO_LARGE"
    assert "5MB" in exc.value.message


@pytest.mark.asyncio
async def test_validate_invalid_extension():
    """Test invalid extension rejected"""
    with pytest.raises(FileValidationError) as exc:
        await validate_file("test.txt", b"content")
    assert exc.value.code == "INVALID_FILE_TYPE"
    assert "PDF" in exc.value.message


@pytest.mark.asyncio
async def test_validate_invalid_mime_type():
    """Test MIME type validation"""
    # File with .pdf extension but wrong content
    with pytest.raises(FileValidationError) as exc:
        await validate_file("fake.pdf", b"This is just text content")
    assert exc.value.code in ["INVALID_MIME_TYPE", "INVALID_FILE_STRUCTURE"]


@pytest.mark.asyncio
async def test_validate_docx_success():
    """Test valid DOCX file passes validation (ZIP-based format)"""
    # DOCX files start with PK (ZIP magic bytes)
    docx_content = b"PK\x03\x04" + b"\x00" * 100
    result = await validate_file("document.docx", docx_content)
    assert result["extension"] == ".docx"
    assert result["filename"] == "document.docx"

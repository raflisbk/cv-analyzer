"""
API endpoint tests for upload functionality
Tests UPLOAD-01, UPLOAD-02, ERROR-01 requirements
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_upload_endpoint_returns_job_id():
    """Test upload returns job_id in wrapped response"""
    # Create minimal valid PDF
    pdf_content = b"%PDF-1.4\n%EOF"
    files = {"file": ("test.pdf", pdf_content, "application/pdf")}

    response = client.post("/api/v1/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "job_id" in data["data"]
    assert "meta" in data
    assert "request_id" in data["meta"]


def test_upload_rejects_large_file():
    """Test file size validation per D-02, ERROR-01"""
    large_content = b"%PDF-1.4\n" + (b"0" * (6 * 1024 * 1024))  # 6MB
    files = {"file": ("large.pdf", large_content, "application/pdf")}

    response = client.post("/api/v1/upload", files=files)

    assert response.status_code == 200  # Still 200 with error in wrapped response
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "FILE_TOO_LARGE"


def test_upload_rejects_invalid_type():
    """Test file type validation per ERROR-01"""
    files = {"file": ("test.txt", b"content", "text/plain")}

    response = client.post("/api/v1/upload", files=files)

    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_FILE_TYPE"

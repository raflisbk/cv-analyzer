"""
API endpoint tests for upload functionality
Tests UPLOAD-01, UPLOAD-02, ERROR-01 requirements
"""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


# Override database dependency for all tests
async def override_get_db():
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock(
        side_effect=lambda obj: (
            setattr(obj, "id", uuid4())
            if not hasattr(obj, "id") or obj.id is None
            else None
        )
    )
    yield mock_session


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# Mock storage service for tests
@pytest.fixture(autouse=True)
def mock_storage():
    with patch("app.api.v1.endpoints.upload.storage_service") as mock_svc:
        mock_svc.upload_file.return_value = "test-file-id-123"
        yield mock_svc


# Mock Celery task for tests
@pytest.fixture(autouse=True)
def mock_celery_task():
    with patch("app.api.v1.endpoints.upload.process_document_task") as mock_task:
        mock_task.delay.return_value = None
        yield mock_task


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

import pytest
from unittest.mock import Mock, patch

from app.services.storage import StorageService


@pytest.fixture
def mock_s3_client():
    with patch("boto3.client") as mock_client:
        yield mock_client.return_value


def test_upload_file_generates_uuid_filename(mock_s3_client):
    """Test file upload uses UUID-based naming per D-17"""
    storage = StorageService()
    file_id = storage.upload_file(
        content=b"test content",
        original_filename="resume.pdf",
        metadata={"mime_type": "application/pdf", "size": 12},
    )

    # Verify UUID format: {uuid}-{original_filename}
    assert "-resume.pdf" in file_id
    assert len(file_id.split("-")[0]) == 8  # First part of UUID


def test_upload_file_sets_metadata(mock_s3_client):
    """Test file metadata stored per D-21"""
    storage = StorageService()
    storage.upload_file(
        content=b"test",
        original_filename="test.pdf",
        metadata={"mime_type": "application/pdf", "size": 4},
    )

    # Verify put_object called with metadata
    call_args = mock_s3_client.put_object.call_args
    assert "Metadata" in call_args.kwargs
    assert "original-filename" in call_args.kwargs["Metadata"]
    assert "delete-after" in call_args.kwargs["Metadata"]

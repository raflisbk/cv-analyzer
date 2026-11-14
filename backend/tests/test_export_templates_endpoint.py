import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from app.services.storage import StorageError

from app.api.dependencies import require_user
from app.db.session import get_db
from app.main import app


@pytest.fixture
def client():
    original = dict(app.dependency_overrides)
    user = MagicMock()
    user.id = uuid.uuid4()
    job = MagicMock()
    job.id = uuid.uuid4()
    job.user_id = user.id
    job.file_id = "test-file"
    job.file_metadata = {"filename": "My CV.pdf"}
    job.cv_document = {"sections": [{"type": "experience", "content": "Old line"}]}
    job.scores = None
    job.suggestions = [
        {
            "section": "experience",
            "suggestions": [{"original_text": "Old line", "after_text": "New line"}],
        }
    ]
    session = AsyncMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = job
    session.execute.return_value = result

    async def db_override():
        yield session

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[require_user] = lambda: user
    with TestClient(app) as test_client:
        yield test_client, job, result
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original)


def test_templates_require_authentication():
    original = dict(app.dependency_overrides)
    app.dependency_overrides.clear()
    with TestClient(app) as client:
        assert client.get("/api/v1/export/templates").status_code == 401
    app.dependency_overrides.update(original)


def test_templates_response_shape(client):
    response = client[0].get("/api/v1/export/templates")
    assert response.status_code == 200
    assert set(response.json()["data"][0]) == {
        "id",
        "name",
        "description",
        "atsScore",
        "original",
        "traits",
    }


def test_templates_with_missing_original_keep_original_entry(client):
    test_client, job, _ = client
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        side_effect=StorageError("missing"),
    ):
        response = test_client.get(f"/api/v1/export/templates?jobId={job.id}")
    assert response.status_code == 200
    original = next(
        item for item in response.json()["data"] if item["id"] == "original"
    )
    assert original["atsScore"] is None


def test_original_export_with_missing_file_returns_422(client):
    test_client, job, _ = client
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        side_effect=StorageError("missing"),
    ):
        response = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
        )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "ORIGINAL_FILE_UNAVAILABLE"


def test_seeded_job_without_file_keeps_templates_and_rejects_original(client):
    test_client, job, _ = client
    job.file_id = ""
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        side_effect=AssertionError("Storage must not be called"),
    ):
        templates = test_client.get(f"/api/v1/export/templates?jobId={job.id}")
        original = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
        )
    assert templates.status_code == 200
    assert (
        next(item for item in templates.json()["data"] if item["id"] == "original")[
            "atsScore"
        ]
        is None
    )
    assert original.status_code == 422
    assert original.json()["error"]["code"] == "ORIGINAL_FILE_UNAVAILABLE"


def test_job_scoping_hides_other_owner(client):
    test_client, job, _ = client
    job.user_id = uuid.uuid4()
    assert (
        test_client.get(f"/api/v1/export/templates?jobId={job.id}").status_code == 404
    )
    assert (
        test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "plain"}
        ).status_code
        == 404
    )


def test_unknown_template_returns_404(client):
    test_client, job, _ = client
    assert (
        test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "missing"}
        ).status_code
        == 404
    )


def test_export_returns_counts_and_filename(client):
    test_client, job, _ = client
    with patch("app.api.v1.endpoints.export_templates.render_pdf", return_value=b"PDF"):
        response = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "plain"}
        )
    assert response.status_code == 200
    assert response.headers["x-export-applied"] == "1"
    assert response.headers["x-export-skipped"] == "0"
    assert "My_CV-plain.pdf" in response.headers["content-disposition"]


def test_image_original_returns_422(client):
    test_client, job, _ = client
    job.file_metadata = {"filename": "scan.png"}
    response = test_client.post(
        f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
    )
    assert response.status_code == 422
    assert "text-based PDF or DOCX" in response.json()["detail"]


def test_fix_ids_limit(client):
    test_client, job, _ = client
    response = test_client.post(
        f"/api/v1/jobs/{job.id}/export",
        json={"templateId": "plain", "fixIds": [str(index) for index in range(101)]},
    )
    assert response.status_code == 422


def test_scanned_pdf_original_returns_422(client):
    import fitz

    test_client, job, _ = client
    scan = fitz.open()
    scan.new_page()
    data = scan.tobytes()
    scan.close()
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        return_value=data,
    ):
        response = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
        )
    assert response.status_code == 422


def test_original_pdf_endpoint_reports_actual_counts(client):
    import fitz

    test_client, job, _ = client
    pdf = fitz.open()
    pdf.new_page().insert_text((50, 50), "Old line")
    source = pdf.tobytes()
    pdf.close()
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        return_value=source,
    ):
        response = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
        )
    assert response.status_code == 200
    assert response.headers["x-export-applied"] == "1"
    assert response.headers["x-export-skipped"] == "0"
    assert (
        "New line" in fitz.open(stream=response.content, filetype="pdf")[0].get_text()
    )


def test_template_list_scores_owners_original(client):
    import fitz

    test_client, job, _ = client
    job.scores = {"ats_score": 68}
    pdf = fitz.open()
    pdf.new_page().insert_text((50, 50), "Alex Morgan")
    source = pdf.tobytes()
    pdf.close()
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        return_value=source,
    ):
        response = test_client.get(f"/api/v1/export/templates?jobId={job.id}")
    assert response.status_code == 200
    assert response.json()["data"][0]["atsScore"] == 68


def test_original_docx_endpoint_returns_docx(client):
    from io import BytesIO

    from docx import Document

    test_client, job, _ = client
    job.file_metadata = {"filename": "resume.docx"}
    source = Document()
    source.add_paragraph("Old line")
    stream = BytesIO()
    source.save(stream)
    with patch(
        "app.api.v1.endpoints.export_templates.storage_service.get_file",
        return_value=stream.getvalue(),
    ):
        response = test_client.post(
            f"/api/v1/jobs/{job.id}/export", json={"templateId": "original"}
        )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument"
    )
    assert "resume-original.docx" in response.headers["content-disposition"]
    assert Document(BytesIO(response.content)).paragraphs[0].text == "New line"

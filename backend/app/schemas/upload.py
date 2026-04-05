"""Upload request/response schemas"""

from pydantic import BaseModel


class UploadResponse(BaseModel):
    job_id: str
    message: str = "File uploaded successfully. Processing started."

"""Job schemas"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.models.job import JobStatus


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: JobStatus
    file_id: str
    stages: dict[str, bool]
    error: str | None = None
    file_metadata: dict[str, Any]
    result: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

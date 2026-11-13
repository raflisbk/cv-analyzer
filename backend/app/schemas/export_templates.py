from pydantic import BaseModel, ConfigDict, Field


class ExportTemplate(BaseModel):
    id: str
    name: str
    description: str
    ats_score: int | None = Field(alias="atsScore")
    original: bool
    traits: list[str]


class ExportRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    template_id: str = Field(alias="templateId")
    fix_ids: list[str] | None = Field(default=None, alias="fixIds", max_length=100)
    answers: dict[str, dict[str, str]] = Field(default_factory=dict)

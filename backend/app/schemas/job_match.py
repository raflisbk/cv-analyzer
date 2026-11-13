from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.app_lists import to_camel


class JobMatchRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    job_description: str = Field(min_length=50, max_length=6000)


class ExtractedRequirement(BaseModel):
    label: str = Field(min_length=1, max_length=60)
    weight: Literal["must", "nice"]
    category: Literal["skills", "experience", "education", "keywords", "seniority"]
    status: Literal["met", "missing", "partial"]
    evidence_quote: str = Field(max_length=1000)


class Extraction(BaseModel):
    requirements: list[ExtractedRequirement] = Field(max_length=15)


class MatchRequirement(BaseModel):
    label: str
    weight: Literal["must", "nice"]
    status: Literal["met", "missing", "partial"]
    evidence: str
    category: (
        Literal["skills", "experience", "education", "keywords", "seniority"] | None
    ) = Field(default=None, exclude=True)


class MatchDimension(BaseModel):
    key: str
    score: int


class JobMatchData(BaseModel):
    score: int
    headline: str
    summary: str
    dimensions: list[MatchDimension]
    requirements: list[MatchRequirement]

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


# =========================================================
# JD MATCHING REQUEST
# =========================================================

class JDMatchingRequest(BaseModel):

    resume_id: str = Field(
        ...,
        min_length=1,
        description="Resume ID"
    )

    job_id: str = Field(
        ...,
        min_length=1,
        description="Job ID"
    )


# =========================================================
# JD MATCHING RESPONSE
# =========================================================

class JDMatchingResponse(BaseModel):

    id: str

    resume_id: str

    job_id: str

    student_id: str

    match_percentage: int = Field(
        ...,
        ge=0,
        le=100
    )

    matched_skills: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    strengths: List[str] = Field(
        default_factory=list
    )

    recommendations: List[str] = Field(
        default_factory=list
    )

    overall_feedback: str = ""

    created_at: datetime

    updated_at: datetime
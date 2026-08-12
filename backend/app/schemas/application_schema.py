from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# =========================================================
# APPLY JOB
# =========================================================

class ApplicationCreate(BaseModel):

    student_id: str = Field(
        ...,
        min_length=1,
        description="Student/User ID"
    )

    job_id: str = Field(
        ...,
        min_length=1,
        description="Job ID"
    )

    resume_id: str = Field(
        ...,
        min_length=1,
        description="Selected Resume ID"
    )


# =========================================================
# UPDATE APPLICATION
# =========================================================

class ApplicationUpdate(BaseModel):

    application_status: Optional[str] = None

    interview_status: Optional[str] = None

    recruiter_feedback: Optional[str] = None

    resume_score: Optional[int] = Field(
        default=None,
        ge=0,
        le=100
    )

    jd_match_score: Optional[int] = Field(
        default=None,
        ge=0,
        le=100
    )

    matched_skills: Optional[List[str]] = None

    missing_skills: Optional[List[str]] = None


# =========================================================
# APPLICATION RESPONSE
# =========================================================

class ApplicationResponse(BaseModel):

    id: str

    student_id: str

    organization_id: str

    job_id: str

    resume_id: str

    student_name: str

    student_email: str

    company_name: str

    job_title: str

    resume_score: int

    jd_match_score: int

    matched_skills: List[str]

    missing_skills: List[str]

    application_status: str

    interview_status: str

    recruiter_feedback: str

    viewed_by_recruiter: bool

    created_at: datetime

    updated_at: datetime
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    bucket_key: str
    file_url: str
    file_size: int
    upload_status: str
    uploaded_at: datetime


class ResumeAnalysisResponse(BaseModel):
    resume_id: str
    resume_score: int
    skills: list
    education: list
    experience: list
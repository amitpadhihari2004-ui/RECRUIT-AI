from pydantic import BaseModel
from typing import List


# ==========================================
# Recommended Job
# ==========================================

class RecommendedJob(BaseModel):
    job_id: str

    title: str
    company_name: str

    department: str
    location: str

    employment_type: str
    experience_required: str
    salary: str

    match_score: int

    matched_skills: List[str]
    missing_skills: List[str]

    recommendation_reason: str


# ==========================================
# Recommendation Response
# ==========================================

class RecommendationResponse(BaseModel):
    success: bool

    resume_id: str

    count: int

    recommendations: List[RecommendedJob]
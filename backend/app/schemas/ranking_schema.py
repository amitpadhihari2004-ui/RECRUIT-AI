from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# =========================================================
# GENERATE RANKING
# =========================================================

class RankingGenerate(BaseModel):

    job_id: str


# =========================================================
# RANKING RESPONSE
# =========================================================

class RankingResponse(BaseModel):

    id: str

    student_id: Optional[str] = None

    student_name: Optional[str] = None

    student_email: Optional[str] = None

    organization_id: Optional[str] = None

    job_id: str

    application_id: str

    resume_id: Optional[str] = None

    interview_id: Optional[str] = None

    monitoring_id: Optional[str] = None

    # -----------------------------------------------------
    # SCORE BREAKDOWN
    # -----------------------------------------------------

    resume_score: int = 0

    jd_match_score: int = 0

    interview_score: int = 0

    integrity_score: int = 0

    final_score: int = 0

    # -----------------------------------------------------
    # RANK
    # -----------------------------------------------------

    rank: int = 0

    # -----------------------------------------------------
    # AI RECOMMENDATION
    # -----------------------------------------------------

    recommendation: str

    # -----------------------------------------------------
    # CANDIDATE DECISION
    # -----------------------------------------------------

    selection_status: str

    decision_reason: Optional[str] = None

    # -----------------------------------------------------
    # AI ORIGINAL DECISION
    # -----------------------------------------------------
    #
    # Important for Candidate Decision Management.
    #
    # Example:
    #
    # AI says: Shortlisted
    # Recruiter changes: Rejected
    #
    # ai_selection_status remains:
    #
    # Shortlisted
    #
    # while selection_status becomes:
    #
    # Rejected
    #
    # -----------------------------------------------------

    ai_selection_status: Optional[str] = None

    ai_decision_reason: Optional[str] = None

    # -----------------------------------------------------
    # MANUAL DECISION
    # -----------------------------------------------------

    manually_decided: bool = False

    manual_decision_by: Optional[str] = None

    manual_decision_at: Optional[datetime] = None

    manual_decision_reason: Optional[str] = None

    # -----------------------------------------------------
    # SKILLS
    # -----------------------------------------------------

    matched_skills: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # AVAILABILITY
    # -----------------------------------------------------

    interview_available: bool = False

    integrity_available: bool = False

    # -----------------------------------------------------
    # TIMESTAMPS
    # -----------------------------------------------------

    created_at: datetime

    updated_at: datetime


# =========================================================
# RANKING SUMMARY
# =========================================================

class RankingSummary(BaseModel):

    student_id: Optional[str] = None

    student_name: Optional[str] = None

    student_email: Optional[str] = None

    application_id: Optional[str] = None

    final_score: int = 0

    rank: int = 0

    recommendation: str

    selection_status: str

    decision_reason: Optional[str] = None

    ai_selection_status: Optional[str] = None

    manually_decided: bool = False


# =========================================================
# RANKING STATISTICS
# =========================================================

class RankingStatistics(BaseModel):

    # -----------------------------------------------------
    # TOTAL
    # -----------------------------------------------------

    total_candidates: int = 0

    # -----------------------------------------------------
    # AI RECOMMENDATIONS
    # -----------------------------------------------------

    highly_recommended: int = 0

    recommended: int = 0

    consider: int = 0

    average: int = 0

    not_recommended: int = 0

    # -----------------------------------------------------
    # CANDIDATE DECISIONS
    # -----------------------------------------------------

    selected: int = 0

    shortlisted: int = 0

    under_review: int = 0

    on_hold: int = 0

    rejected: int = 0

    # -----------------------------------------------------
    # SCORES
    # -----------------------------------------------------

    average_score: float = 0

    highest_score: float = 0

    lowest_score: float = 0
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict


# =========================================================
# ANALYTICS REQUEST
# =========================================================
#
# Used when requesting analytics for one student.
#
# Example:
# GET /analytics/student/{student_id}
#
# =========================================================

class AnalyticsRequest(BaseModel):

    student_id: str


# =========================================================
# APPLICATION ANALYTICS
# =========================================================

class ApplicationAnalytics(BaseModel):

    total_applications: int = 0

    active_applications: int = 0

    pending_applications: int = 0

    shortlisted_applications: int = 0

    selected_applications: int = 0

    rejected_applications: int = 0


# =========================================================
# INTERVIEW ANALYTICS
# =========================================================

class StudentInterviewAnalytics(BaseModel):

    total_interviews: int = 0

    completed_interviews: int = 0

    pending_interviews: int = 0

    scheduled_interviews: int = 0

    cancelled_interviews: int = 0


# =========================================================
# RESUME ANALYTICS
# =========================================================

class ResumeAnalytics(BaseModel):

    total_resumes: int = 0

    average_resume_score: float = 0.0

    highest_resume_score: float = 0.0

    lowest_resume_score: float = 0.0


# =========================================================
# JOB MATCH ANALYTICS
# =========================================================

class JDMatchAnalytics(BaseModel):

    total_job_matches: int = 0

    average_jd_match_score: float = 0.0

    highest_jd_match_score: float = 0.0

    lowest_jd_match_score: float = 0.0


# =========================================================
# AI INTERVIEW SCORE ANALYTICS
# =========================================================

class AIScoreAnalytics(BaseModel):

    average_interview_score: float = 0.0

    highest_interview_score: float = 0.0

    lowest_interview_score: float = 0.0

    average_technical_score: float = 0.0

    average_communication_score: float = 0.0

    average_confidence_score: float = 0.0


# =========================================================
# INTEGRITY / PROCTORING ANALYTICS
# =========================================================

class IntegrityAnalytics(BaseModel):

    average_integrity_score: float = 0.0

    total_warnings: int = 0

    suspicious_events: int = 0

    tab_switches: int = 0

    fullscreen_exits: int = 0

    multiple_person_detected: int = 0

    face_not_detected: int = 0

    camera_warnings: int = 0

    microphone_warnings: int = 0

    copy_paste_events: int = 0

    overall_status: str = "Normal"


# =========================================================
# FINAL PERFORMANCE ANALYTICS
# =========================================================

class FinalScoreAnalytics(BaseModel):

    average_final_score: float = 0.0

    highest_final_score: float = 0.0

    lowest_final_score: float = 0.0


# =========================================================
# SKILLS ANALYTICS
# =========================================================

class SkillsAnalytics(BaseModel):

    matched_skills: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    top_skills: List[str] = Field(
        default_factory=list
    )


# =========================================================
# APPLICATION STATUS DISTRIBUTION
# =========================================================
#
# Example:
#
# {
#     "Applied": 5,
#     "Shortlisted": 2,
#     "Interview": 1,
#     "Selected": 1,
#     "Rejected": 1
# }
#
# =========================================================

class ApplicationStatusDistribution(BaseModel):

    applied: int = 0

    pending: int = 0

    shortlisted: int = 0

    interview: int = 0

    selected: int = 0

    rejected: int = 0


# =========================================================
# SCORE DISTRIBUTION
# =========================================================
#
# Used for bar charts / graphs.
#
# =========================================================

class ScoreDistribution(BaseModel):

    range_0_20: int = 0

    range_21_40: int = 0

    range_41_60: int = 0

    range_61_80: int = 0

    range_81_100: int = 0


# =========================================================
# MONTHLY PERFORMANCE
# =========================================================
#
# Used for line / bar charts.
#
# =========================================================

class MonthlyPerformance(BaseModel):

    month: str

    applications: int = 0

    interviews: int = 0

    selections: int = 0

    average_score: float = 0.0


# =========================================================
# INTERVIEW PERFORMANCE
# =========================================================
#
# Used for interview performance graph.
#
# =========================================================

class InterviewPerformance(BaseModel):

    interview_id: str

    job_title: Optional[str] = None

    interview_type: Optional[str] = None

    score: float = 0.0

    technical_score: float = 0.0

    communication_score: float = 0.0

    confidence_score: float = 0.0

    integrity_score: float = 0.0

    final_score: float = 0.0

    status: str = "Pending"

    completed_at: Optional[datetime] = None


# =========================================================
# APPLICATION PERFORMANCE
# =========================================================
#
# Used for showing individual applications.
#
# =========================================================

class ApplicationPerformance(BaseModel):

    application_id: str

    job_id: Optional[str] = None

    job_title: Optional[str] = None

    company_name: Optional[str] = None

    application_status: str = "Pending"

    resume_score: float = 0.0

    jd_match_score: float = 0.0

    interview_score: float = 0.0

    integrity_score: float = 0.0

    final_score: float = 0.0

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None


# =========================================================
# STUDENT ANALYTICS RESPONSE
# =========================================================
#
# MAIN RESPONSE FOR:
#
# GET /analytics/student/{student_id}
#
# This response belongs to ONE student only.
#
# =========================================================

class StudentAnalyticsResponse(BaseModel):

    # -----------------------------------------------------
    # IDENTIFICATION
    # -----------------------------------------------------

    student_id: str

    student_name: Optional[str] = None

    student_email: Optional[str] = None


    # -----------------------------------------------------
    # APPLICATION ANALYTICS
    # -----------------------------------------------------

    applications: ApplicationAnalytics = Field(
        default_factory=ApplicationAnalytics
    )


    # -----------------------------------------------------
    # INTERVIEW ANALYTICS
    # -----------------------------------------------------

    interviews: StudentInterviewAnalytics = Field(
        default_factory=StudentInterviewAnalytics
    )


    # -----------------------------------------------------
    # RESUME ANALYTICS
    # -----------------------------------------------------

    resume: ResumeAnalytics = Field(
        default_factory=ResumeAnalytics
    )


    # -----------------------------------------------------
    # JD MATCH ANALYTICS
    # -----------------------------------------------------

    jd_match: JDMatchAnalytics = Field(
        default_factory=JDMatchAnalytics
    )


    # -----------------------------------------------------
    # AI SCORE ANALYTICS
    # -----------------------------------------------------

    ai_scores: AIScoreAnalytics = Field(
        default_factory=AIScoreAnalytics
    )


    # -----------------------------------------------------
    # INTEGRITY / PROCTORING
    # -----------------------------------------------------

    integrity: IntegrityAnalytics = Field(
        default_factory=IntegrityAnalytics
    )


    # -----------------------------------------------------
    # FINAL PERFORMANCE
    # -----------------------------------------------------

    final_score: FinalScoreAnalytics = Field(
        default_factory=FinalScoreAnalytics
    )


    # -----------------------------------------------------
    # SKILLS
    # -----------------------------------------------------

    skills: SkillsAnalytics = Field(
        default_factory=SkillsAnalytics
    )


    # -----------------------------------------------------
    # APPLICATION STATUS
    # -----------------------------------------------------

    application_status: ApplicationStatusDistribution = Field(
        default_factory=ApplicationStatusDistribution
    )


    # -----------------------------------------------------
    # SCORE DISTRIBUTION
    # -----------------------------------------------------

    resume_score_distribution: ScoreDistribution = Field(
        default_factory=ScoreDistribution
    )

    interview_score_distribution: ScoreDistribution = Field(
        default_factory=ScoreDistribution
    )

    final_score_distribution: ScoreDistribution = Field(
        default_factory=ScoreDistribution
    )


    # -----------------------------------------------------
    # MONTHLY PERFORMANCE
    # -----------------------------------------------------

    monthly_performance: List[MonthlyPerformance] = Field(
        default_factory=list
    )


    # -----------------------------------------------------
    # INTERVIEW PERFORMANCE
    # -----------------------------------------------------

    interview_performance: List[InterviewPerformance] = Field(
        default_factory=list
    )


    # -----------------------------------------------------
    # APPLICATION PERFORMANCE
    # -----------------------------------------------------

    application_performance: List[ApplicationPerformance] = Field(
        default_factory=list
    )


    # -----------------------------------------------------
    # TIMESTAMPS
    # -----------------------------------------------------

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None


# =========================================================
# OPTIONAL: SIMPLE STUDENT DASHBOARD RESPONSE
# =========================================================
#
# Useful if you want a lightweight response for the
# student dashboard instead of loading every graph.
#
# =========================================================

class StudentDashboardSummary(BaseModel):

    student_id: str

    total_applications: int = 0

    shortlisted_applications: int = 0

    selected_applications: int = 0

    rejected_applications: int = 0

    total_interviews: int = 0

    completed_interviews: int = 0

    average_resume_score: float = 0.0

    average_jd_match_score: float = 0.0

    average_interview_score: float = 0.0

    average_integrity_score: float = 0.0

    average_final_score: float = 0.0


# =========================================================
# OPTIONAL: STUDENT ANALYTICS ERROR RESPONSE
# =========================================================

class AnalyticsErrorResponse(BaseModel):

    success: bool = False

    message: str

    student_id: Optional[str] = None
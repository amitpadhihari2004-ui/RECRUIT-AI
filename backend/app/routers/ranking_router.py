from typing import Optional

from fastapi import APIRouter

from app.services.ranking_service import RankingService


router = APIRouter(
    prefix="/ranking",
    tags=["Candidate Ranking"]
)


# =========================================================
# GENERATE RANKING
# =========================================================

@router.post("/generate/{job_id}")
def generate_ranking(
    job_id: str
):
    return RankingService.generate_ranking(
        job_id
    )


# =========================================================
# REGENERATE RANKING
# =========================================================

@router.post("/regenerate/{job_id}")
def regenerate_ranking(
    job_id: str
):
    return RankingService.regenerate_ranking(
        job_id
    )


# =========================================================
# GET ALL RANKINGS
# =========================================================

@router.get("/")
def get_all_rankings():
    return RankingService.get_all_rankings()


# =========================================================
# GET RANKING STATISTICS
# IMPORTANT:
# Keep this before /{ranking_id}
# =========================================================

@router.get("/job/{job_id}/statistics")
def get_ranking_statistics(
    job_id: str
):
    return RankingService.get_ranking_statistics(
        job_id
    )


# =========================================================
# GET TOP CANDIDATES
# =========================================================

@router.get("/job/{job_id}/top")
def get_top_candidates(
    job_id: str,
    limit: int = 10
):
    return RankingService.get_top_candidates(
        job_id,
        limit
    )


# =========================================================
# GET RANKINGS BY JOB
# =========================================================

@router.get("/job/{job_id}")
def get_rankings_by_job(
    job_id: str
):
    return RankingService.get_rankings_by_job(
        job_id
    )


# =========================================================
# GET RANKINGS BY STUDENT
# =========================================================

@router.get("/student/{student_id}")
def get_rankings_by_student(
    student_id: str
):
    return RankingService.get_rankings_by_student(
        student_id
    )


# =========================================================
# GET CANDIDATE RANKING SUMMARY
# =========================================================

@router.get("/summary/{ranking_id}")
def get_candidate_ranking_summary(
    ranking_id: str
):
    return RankingService.get_candidate_ranking_summary(
        ranking_id
    )


# =========================================================
# UPDATE CANDIDATE DECISION
# =========================================================
#
# Recruiter can manually change:
#
# Selected
# Shortlisted
# Under Review
# Consider
# Rejected
#
# Example:
#
# PATCH
# /ranking/65abc.../decision?decision=Selected
#
# =========================================================

@router.patch("/{ranking_id}/decision")
def update_candidate_decision(
    ranking_id: str,
    decision: str,
    reason: Optional[str] = None
):
    return RankingService.update_candidate_decision(
        ranking_id=ranking_id,
        decision=decision,
        reason=reason or ""
    )


# =========================================================
# RESET CANDIDATE DECISION TO AI
# =========================================================
#
# If recruiter manually changed the decision,
# this restores the original AI-based decision.
#
# Example:
#
# PATCH
# /ranking/65abc.../decision/reset
#
# =========================================================

@router.patch("/{ranking_id}/decision/reset")
def reset_candidate_decision(
    ranking_id: str
):
    return RankingService.reset_candidate_decision(
        ranking_id
    )


# =========================================================
# DELETE ALL RANKINGS FOR JOB
# =========================================================

@router.delete("/job/{job_id}")
def delete_job_rankings(
    job_id: str
):
    return RankingService.delete_job_rankings(
        job_id
    )


# =========================================================
# GET SINGLE RANKING
# =========================================================

@router.get("/{ranking_id}")
def get_ranking(
    ranking_id: str
):
    return RankingService.get_ranking(
        ranking_id
    )


# =========================================================
# DELETE SINGLE RANKING
# =========================================================

@router.delete("/{ranking_id}")
def delete_ranking(
    ranking_id: str
):
    return RankingService.delete_ranking(
        ranking_id
    )
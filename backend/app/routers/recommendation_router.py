from fastapi import APIRouter, Query

from app.services.recommendation_service import RecommendationService


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Job Recommendations"]
)


# =====================================================
# GET AI JOB RECOMMENDATIONS
# =====================================================

@router.get("/{user_id}")
def get_recommended_jobs(
    user_id: str,
    limit: int = Query(
        default=5,
        ge=1,
        le=10
    )
):
    """
    Get AI-recommended jobs according to
    the student's latest analyzed resume.
    """

    return RecommendationService.get_recommended_jobs(
        user_id=user_id,
        limit=limit
    )
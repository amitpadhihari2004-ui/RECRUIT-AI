from fastapi import APIRouter

from app.schemas.jd_matching_schema import JDMatchingRequest
from app.services.jd_matching_service import JDMatchingService


router = APIRouter(
    prefix="/jd-matching",
    tags=["JD Matching"]
)


# =========================================================
# POST - MATCH RESUME WITH JOB
# =========================================================

@router.post("/match")
def match_resume(request: JDMatchingRequest):

    return JDMatchingService.match_resume_with_job(
        resume_id=request.resume_id,
        job_id=request.job_id
    )


# =========================================================
# GET - ALL MATCH RESULTS
# =========================================================

@router.get("/")
def get_all_match_results():

    return JDMatchingService.get_all_match_results()


# =========================================================
# GET - MATCHES BY STUDENT
# =========================================================

@router.get("/student/{student_id}")
def get_matches_by_student(
    student_id: str
):

    return JDMatchingService.get_matches_by_student(
        student_id
    )


# =========================================================
# GET - MATCHES BY JOB
# =========================================================

@router.get("/job/{job_id}")
def get_matches_by_job(
    job_id: str
):

    return JDMatchingService.get_matches_by_job(
        job_id
    )


# =========================================================
# GET - SINGLE MATCH RESULT
# =========================================================

@router.get("/{match_id}")
def get_match_result(
    match_id: str
):

    return JDMatchingService.get_match_result(
        match_id
    )


# =========================================================
# DELETE - MATCH RESULT
# =========================================================

@router.delete("/{match_id}")
def delete_match_result(
    match_id: str
):

    return JDMatchingService.delete_match_result(
        match_id
    )
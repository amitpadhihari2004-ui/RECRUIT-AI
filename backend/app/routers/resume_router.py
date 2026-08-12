from fastapi import APIRouter, UploadFile, File, Query

from app.services.resume_service import ResumeService
from app.services.analysis_resume import ResumeAnalysisService


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


# ==========================================================
# Upload Resume
# ==========================================================

@router.post("/upload")
async def upload_resume(
    user_id: str = Query(...),
    file: UploadFile = File(...)
):
    return ResumeService.upload_resume(
        user_id=user_id,
        file=file
    )


# ==========================================================
# Analyze Resume
# ==========================================================

@router.post("/{resume_id}/analyze")
def analyze_resume(resume_id: str):

    return ResumeAnalysisService.analyze_resume(
        resume_id
    )


# ==========================================================
# Get Resume Analysis
# ==========================================================

@router.get("/{resume_id}/analysis")
def get_resume_analysis(resume_id: str):

    return ResumeService.get_resume_analysis(
        resume_id
    )


# ==========================================================
# Get All Resumes
# ==========================================================

@router.get("/")
def get_all_resumes():

    return ResumeService.get_all_resumes()


# ==========================================================
# Get User Resumes
# ==========================================================

@router.get("/user/{user_id}")
def get_user_resumes(user_id: str):

    return ResumeService.get_user_resumes(
        user_id
    )


# ==========================================================
# Get Single Resume
# ==========================================================

@router.get("/{resume_id}")
def get_resume(resume_id: str):

    return ResumeService.get_resume(
        resume_id
    )


# ==========================================================
# Delete Resume
# ==========================================================

@router.delete("/{resume_id}")
def delete_resume(resume_id: str):

    return ResumeService.delete_resume(
        resume_id
    )
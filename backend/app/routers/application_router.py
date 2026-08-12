from fastapi import APIRouter

from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate
)

from app.services.application_service import (
    ApplicationService
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# =========================================================
# APPLY FOR JOB
# =========================================================

@router.post("/apply")
def apply_job(data: ApplicationCreate):

    return ApplicationService.apply_job(data)


# =========================================================
# GET ALL APPLICATIONS
# =========================================================

@router.get("/")
def get_all_applications():

    return ApplicationService.get_all_applications()


# =========================================================
# GET STUDENT APPLICATIONS
# =========================================================

@router.get("/student/{student_id}")
def get_student_applications(
    student_id: str
):

    return ApplicationService.get_student_applications(
        student_id
    )


# =========================================================
# GET ORGANIZATION APPLICATIONS
# =========================================================

@router.get("/organization/{organization_id}")
def get_organization_applications(
    organization_id: str
):

    return ApplicationService.get_organization_applications(
        organization_id
    )


# =========================================================
# GET JOB APPLICATIONS
# =========================================================

@router.get("/job/{job_id}")
def get_job_applications(
    job_id: str
):

    return ApplicationService.get_job_applications(
        job_id
    )


# =========================================================
# GET SINGLE APPLICATION
# =========================================================

@router.get("/{application_id}")
def get_application(
    application_id: str
):

    return ApplicationService.get_application(
        application_id
    )


# =========================================================
# UPDATE APPLICATION STATUS
# =========================================================

@router.put("/{application_id}/status")
def update_application_status(
    application_id: str,
    data: ApplicationUpdate
):

    return ApplicationService.update_application_status(
        application_id,
        data
    )


# =========================================================
# DELETE APPLICATION
# =========================================================

@router.delete("/{application_id}")
def delete_application(
    application_id: str
):

    return ApplicationService.delete_application(
        application_id
    )
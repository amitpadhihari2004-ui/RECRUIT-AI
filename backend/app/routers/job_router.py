from fastapi import APIRouter

from app.schemas.job_schema import (
    JobCreate,
    JobUpdate
)

from app.services.job_service import JobService

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

# ==============================
# Create Job
# ==============================

@router.post("/create")
def create_job(
    organization_id: str,
    job: JobCreate
):
    return JobService.create_job(
        organization_id,
        job
    )


# ==============================
# Get All Jobs
# ==============================

@router.get("/")
def get_all_jobs():
    return JobService.get_all_jobs()


# ==============================
# Get Published Jobs
# IMPORTANT:
# Keep this ABOVE /{job_id}
# ==============================

@router.get("/published")
def get_published_jobs():
    return JobService.get_published_jobs()


# ==============================
# Get Jobs By Organization
# ==============================

@router.get("/organization/{organization_id}")
def get_jobs_by_organization(
    organization_id: str
):
    return JobService.get_jobs_by_organization(
        organization_id
    )


# ==============================
# Get Single Job
# Keep AFTER all fixed routes
# ==============================

@router.get("/{job_id}")
def get_job(job_id: str):
    return JobService.get_job(job_id)


# ==============================
# Update Job
# ==============================

@router.put("/{job_id}")
def update_job(
    job_id: str,
    job: JobUpdate
):
    return JobService.update_job(
        job_id,
        job
    )


# ==============================
# Publish Job
# ==============================

@router.put("/publish/{job_id}")
def publish_job(job_id: str):
    return JobService.publish_job(job_id)


# ==============================
# Close Job
# ==============================

@router.put("/close/{job_id}")
def close_job(job_id: str):
    return JobService.close_job(job_id)


# ==============================
# Delete Job
# ==============================

@router.delete("/{job_id}")
def delete_job(job_id: str):
    return JobService.delete_job(job_id)
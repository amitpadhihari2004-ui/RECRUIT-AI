from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

from app.models.job_model import job_collection
from app.models.organization_model import organization_collection
from app.schemas.job_schema import (
    JobCreate,
    JobUpdate
)


class JobService:

    @staticmethod
    def create_job(organization_id: str, job: JobCreate):
        """
        Create a new job for an organization.
        Validates organization existence before creating the job.
        """
        # Validate organization_id format
        if not ObjectId.is_valid(organization_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Organization ID."
            )

        # Verify organization exists
        organization = organization_collection.find_one(
            {"_id": ObjectId(organization_id)}
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        job_data = {
            "organization_id": ObjectId(organization_id),
            "title": job.title,
            "department": job.department,
            "location": job.location,
            "employment_type": job.employment_type,
            "experience_required": job.experience_required,
            "salary": job.salary,
            "description": job.description,
            "skills": job.skills,
            "requirements": job.requirements,
            "status": "Draft",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = job_collection.insert_one(job_data)

        return {
            "success": True,
            "message": "Job Created Successfully.",
            "job_id": str(result.inserted_id)
        }

    @staticmethod
    def get_all_jobs():
        """
        Retrieve all jobs from the database.
        """
        jobs = []

        for job in job_collection.find():
            job["_id"] = str(job["_id"])
            job["organization_id"] = str(job["organization_id"])
            jobs.append(job)

        return jobs

    @staticmethod
    def get_job(job_id: str):
        """
        Retrieve a specific job by ID.
        """
        # Validate job_id format
        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        job = job_collection.find_one(
            {"_id": ObjectId(job_id)}
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        job["_id"] = str(job["_id"])
        job["organization_id"] = str(job["organization_id"])

        return job

    @staticmethod
    def get_jobs_by_organization(organization_id: str):
        """
        Retrieve all jobs for a specific organization.
        """
        # Validate organization_id format
        if not ObjectId.is_valid(organization_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Organization ID."
            )

        jobs = []

        for job in job_collection.find(
            {"organization_id": ObjectId(organization_id)}
        ):
            job["_id"] = str(job["_id"])
            job["organization_id"] = str(job["organization_id"])
            jobs.append(job)

        return jobs

    @staticmethod
    def update_job(job_id: str, job: JobUpdate):
        """
        Update an existing job.
        """
        # Validate job_id format
        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        # Verify job exists
        existing_job = job_collection.find_one(
            {"_id": ObjectId(job_id)}
        )

        if not existing_job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        update_data = job.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        result = job_collection.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        return {
            "success": True,
            "message": "Job Updated Successfully."
        }

    @staticmethod
    def publish_job(job_id: str):
        """
        Publish a job by changing its status to "Published".
        """
        # Validate job_id format
        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        # Verify job exists
        existing_job = job_collection.find_one(
            {"_id": ObjectId(job_id)}
        )

        if not existing_job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        job_collection.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": "Published",
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return {
            "success": True,
            "message": "Job Published Successfully."
        }

    @staticmethod
    def close_job(job_id: str):
        """
        Close a job by changing its status to "Closed".
        """
        # Validate job_id format
        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        # Verify job exists
        existing_job = job_collection.find_one(
            {"_id": ObjectId(job_id)}
        )

        if not existing_job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        job_collection.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": "Closed",
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return {
            "success": True,
            "message": "Job Closed Successfully."
        }

    @staticmethod
    def delete_job(job_id: str):
        """
        Delete a job permanently.
        """
        # Validate job_id format
        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        # Verify job exists before deletion
        existing_job = job_collection.find_one(
            {"_id": ObjectId(job_id)}
        )

        if not existing_job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        job_collection.delete_one(
            {"_id": ObjectId(job_id)}
        )

        return {
            "success": True,
            "message": "Job Deleted Successfully."
        }

    @staticmethod
    def get_published_jobs():
        """
        Retrieve all published jobs with organization details.
        """
        jobs = []

        for job in job_collection.find(
            {"status": "Published"}
        ).sort("created_at", -1):

            organization = organization_collection.find_one(
                {"_id": job["organization_id"]}
            )

            jobs.append({
                "_id": str(job["_id"]),
                "organization_id": str(job["organization_id"]),
                "company_name": organization["company_name"] if organization else "",
                "company_logo": organization.get(
                    "company_logo", ""
                ) if organization else "",
                "industry": organization.get(
                    "industry", ""
                ) if organization else "",
                "title": job["title"],
                "department": job["department"],
                "location": job["location"],
                "employment_type": job["employment_type"],
                "experience_required": job["experience_required"],
                "salary": job["salary"],
                "description": job["description"],
                "skills": job["skills"],
                "requirements": job["requirements"],
                "status": job["status"],
                "created_at": job["created_at"]
            })

        return {
            "success": True,
            "count": len(jobs),
            "jobs": jobs
        }
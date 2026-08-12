from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile, HTTPException

from app.models.resume_model import resume_collection
from app.services.storage_service import StorageService


class ResumeService:

    # ==========================================================
    # Upload Resume
    # Maximum 10 resumes per student
    # ==========================================================

    @staticmethod
    def upload_resume(user_id: str, file: UploadFile):

        # ------------------------------------------------------
        # Validate User ID
        # ------------------------------------------------------

        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid User ID."
            )

        user_object_id = ObjectId(user_id)

        # ------------------------------------------------------
        # Check Maximum Resume Limit
        # ------------------------------------------------------

        resume_count = resume_collection.count_documents(
            {
                "user_id": user_object_id
            }
        )

        if resume_count >= 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 resumes allowed per student."
            )

        # ------------------------------------------------------
        # Validate File
        # ------------------------------------------------------

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file selected."
            )

        # ------------------------------------------------------
        # Upload Resume to Cloudflare R2
        # ------------------------------------------------------

        upload_result = StorageService.upload_resume(file)

        # ------------------------------------------------------
        # Prepare Resume Document
        # ------------------------------------------------------

        resume_data = {
            "user_id": user_object_id,

            "file_name": upload_result["file_name"],

            "bucket_key": upload_result["bucket_key"],

            "file_url": StorageService.generate_file_url(
                upload_result["bucket_key"]
            ),

            "content_type": upload_result["content_type"],

            "file_size": upload_result["file_size"],

            "upload_status": "Uploaded",

            "analysis_status": "Pending",

            "created_at": datetime.utcnow(),

            "updated_at": datetime.utcnow()
        }

        # ------------------------------------------------------
        # Save Resume Metadata to MongoDB
        # ------------------------------------------------------

        result = resume_collection.insert_one(
            resume_data
        )

        # ------------------------------------------------------
        # Return Response
        # ------------------------------------------------------

        return {
            "success": True,
            "message": "Resume uploaded successfully.",

            "resume_id": str(
                result.inserted_id
            ),

            "file_name": resume_data["file_name"],

            "bucket_key": resume_data["bucket_key"],

            "file_url": resume_data["file_url"],

            "resume_count": resume_count + 1,

            "maximum_resumes": 10
        }

    # ==========================================================
    # Get Single Resume
    # ==========================================================

    @staticmethod
    def get_resume(resume_id: str):

        # Validate Resume ID

        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Resume ID."
            )

        resume = resume_collection.find_one(
            {
                "_id": ObjectId(resume_id)
            }
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found."
            )

        # Convert ObjectIds to strings

        resume["_id"] = str(
            resume["_id"]
        )

        resume["user_id"] = str(
            resume["user_id"]
        )

        return resume

    # ==========================================================
    # Get Resume Analysis
    # ==========================================================

    @staticmethod
    def get_resume_analysis(resume_id: str):

        # Validate Resume ID

        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Resume ID."
            )

        resume = resume_collection.find_one(
            {
                "_id": ObjectId(resume_id)
            }
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found."
            )

        # Check Analysis

        if not resume.get("analysis"):
            raise HTTPException(
                status_code=404,
                detail="Resume has not been analyzed yet."
            )

        return {
            "success": True,

            "resume_id": str(
                resume["_id"]
            ),

            "analysis_status": resume.get(
                "analysis_status",
                "Pending"
            ),

            "analysis": resume["analysis"]
        }

    # ==========================================================
    # Delete Resume
    # ==========================================================

    @staticmethod
    def delete_resume(resume_id: str):

        # Validate Resume ID

        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Resume ID."
            )

        resume = resume_collection.find_one(
            {
                "_id": ObjectId(resume_id)
            }
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found."
            )

        # ------------------------------------------------------
        # Delete File from Cloudflare R2
        # ------------------------------------------------------

        StorageService.delete_resume(
            resume["bucket_key"]
        )

        # ------------------------------------------------------
        # Delete Resume from MongoDB
        # ------------------------------------------------------

        resume_collection.delete_one(
            {
                "_id": ObjectId(resume_id)
            }
        )

        return {
            "success": True,
            "message": "Resume deleted successfully."
        }

    # ==========================================================
    # Get All Resumes
    # Admin / Internal Use
    # ==========================================================

    @staticmethod
    def get_all_resumes():

        resumes = []

        for resume in resume_collection.find():

            resume["_id"] = str(
                resume["_id"]
            )

            resume["user_id"] = str(
                resume["user_id"]
            )

            resumes.append(resume)

        return resumes

    # ==========================================================
    # Get All Resumes of a User
    # ==========================================================

    @staticmethod
    def get_user_resumes(user_id: str):

        # ------------------------------------------------------
        # Validate User ID
        # ------------------------------------------------------

        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid User ID."
            )

        resumes = []

        # ------------------------------------------------------
        # Get User Resumes
        # Newest First
        # ------------------------------------------------------

        cursor = resume_collection.find(
            {
                "user_id": ObjectId(user_id)
            }
        ).sort(
            "created_at",
            -1
        )

        for resume in cursor:

            resume["_id"] = str(
                resume["_id"]
            )

            resume["user_id"] = str(
                resume["user_id"]
            )

            # Check Analysis Status

            resume["has_analysis"] = (
                resume.get("analysis_status")
                == "Completed"
            )

            # Add score if analysis exists

            if resume.get("analysis"):

                resume["resume_score"] = (
                    resume["analysis"].get(
                        "resume_score",
                        0
                    )
                )

            else:

                resume["resume_score"] = 0

            resumes.append(resume)

        # ------------------------------------------------------
        # Return User Resume List
        # ------------------------------------------------------

        return {
            "success": True,

            "count": len(resumes),

            "maximum_resumes": 10,

            "remaining_resumes": max(
                0,
                10 - len(resumes)
            ),

            "resumes": resumes
        }
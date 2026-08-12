from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

from app.models.application_model import application_collection
from app.models.job_model import job_collection
from app.models.organization_model import organization_collection
from app.models.resume_model import resume_collection
from app.models.user_model import user_collection
from app.models.jd_matching_model import jd_matching_collection

from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate
)

from app.services.jd_matching_service import JDMatchingService


class ApplicationService:

    # =========================================================
    # APPLY FOR JOB
    # =========================================================

    @staticmethod
    def apply_job(data: ApplicationCreate):

        # =====================================================
        # 1. VALIDATE IDS
        # =====================================================

        if not ObjectId.is_valid(data.student_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Student ID."
            )

        if not ObjectId.is_valid(data.job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        if not ObjectId.is_valid(data.resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Resume ID."
            )

        student_object_id = ObjectId(data.student_id)
        job_object_id = ObjectId(data.job_id)
        resume_object_id = ObjectId(data.resume_id)

        # =====================================================
        # 2. CHECK STUDENT
        # =====================================================

        student = user_collection.find_one(
            {"_id": student_object_id}
        )

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )

        # =====================================================
        # 3. CHECK JOB
        # =====================================================

        job = job_collection.find_one(
            {"_id": job_object_id}
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found."
            )

        # =====================================================
        # 4. CHECK JOB STATUS
        # =====================================================

        if job.get("status") != "Published":
            raise HTTPException(
                status_code=400,
                detail="This job is not accepting applications."
            )

        # =====================================================
        # 5. GET ORGANIZATION
        # =====================================================

        organization_id = job.get("organization_id")

        if not organization_id:
            raise HTTPException(
                status_code=400,
                detail="Job has no associated organization."
            )

        # Handle both ObjectId and string organization_id
        if isinstance(organization_id, str):
            if not ObjectId.is_valid(organization_id):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid Organization ID."
                )

            organization_object_id = ObjectId(
                organization_id
            )
        else:
            organization_object_id = organization_id

        # =====================================================
        # 6. CHECK ORGANIZATION
        # =====================================================

        organization = organization_collection.find_one(
            {"_id": organization_object_id}
        )

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found."
            )

        # =====================================================
        # 7. CHECK RESUME
        # =====================================================

        resume = resume_collection.find_one(
            {"_id": resume_object_id}
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found."
            )

        # =====================================================
        # 8. VERIFY RESUME BELONGS TO STUDENT
        # =====================================================

        resume_user_id = resume.get("user_id")

        if str(resume_user_id) != data.student_id:
            raise HTTPException(
                status_code=400,
                detail="Resume does not belong to this student."
            )

        # =====================================================
        # 9. VERIFY RESUME IS ANALYZED
        # =====================================================

        if resume.get("analysis_status") != "Completed":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Resume must be analyzed before applying."
                )
            )

        analysis = resume.get("analysis")

        if not isinstance(analysis, dict) or not analysis:

            raise HTTPException(
                status_code=400,
                detail="Resume analysis not found."
            )

        # =====================================================
        # 10. PREVENT DUPLICATE APPLICATION
        # =====================================================

        existing = application_collection.find_one(
            {
                "student_id": student_object_id,
                "job_id": job_object_id
            }
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail="Already applied for this job."
            )

        # =====================================================
        # 11. RESUME SCORE
        # =====================================================

        resume_score = analysis.get(
            "resume_score",
            0
        )

        try:
            resume_score = int(resume_score)
        except (TypeError, ValueError):
            resume_score = 0

        resume_score = max(
            0,
            min(100, resume_score)
        )

        # =====================================================
        # 12. FIND EXISTING JD MATCH
        # =====================================================

        jd_match = jd_matching_collection.find_one(
            {
                "resume_id": resume_object_id,
                "job_id": job_object_id
            }
        )

        # =====================================================
        # 13. CREATE JD MATCH IF NOT AVAILABLE
        # =====================================================

        if not jd_match:

            print(
                "No existing JD match found."
            )

            print(
                "Automatically creating JD match..."
            )

            JDMatchingService.match_resume_with_job(
                resume_id=data.resume_id,
                job_id=data.job_id
            )

            # Fetch newly created match
            jd_match = jd_matching_collection.find_one(
                {
                    "resume_id": resume_object_id,
                    "job_id": job_object_id
                }
            )

        # =====================================================
        # 14. GET JD MATCH DATA
        # =====================================================

        jd_match_score = 0
        matched_skills = []
        missing_skills = []

        if jd_match:

            jd_match_score = jd_match.get(
                "match_percentage",
                0
            )

            matched_skills = jd_match.get(
                "matched_skills",
                []
            )

            missing_skills = jd_match.get(
                "missing_skills",
                []
            )

        # =====================================================
        # 15. VALIDATE JD SCORE
        # =====================================================

        try:
            jd_match_score = int(
                jd_match_score
            )
        except (TypeError, ValueError):

            jd_match_score = 0

        jd_match_score = max(
            0,
            min(100, jd_match_score)
        )

        # =====================================================
        # 16. ENSURE SKILLS ARE LISTS
        # =====================================================

        if not isinstance(
            matched_skills,
            list
        ):
            matched_skills = []

        if not isinstance(
            missing_skills,
            list
        ):
            missing_skills = []

        # =====================================================
        # 17. CREATE APPLICATION
        # =====================================================

        application = {

            "student_id":
                student_object_id,

            "organization_id":
                organization_object_id,

            "job_id":
                job_object_id,

            "resume_id":
                resume_object_id,

            "student_name":
                student.get(
                    "full_name",
                    ""
                ),

            "student_email":
                student.get(
                    "email",
                    ""
                ),

            "company_name":
                organization.get(
                    "company_name",
                    ""
                ),

            "job_title":
                job.get(
                    "title",
                    ""
                ),

            "resume_score":
                resume_score,

            "jd_match_score":
                jd_match_score,

            "matched_skills":
                matched_skills,

            "missing_skills":
                missing_skills,

            "application_status":
                "Pending",

            "interview_status":
                "Not Scheduled",

            "recruiter_feedback":
                "",

            "viewed_by_recruiter":
                False,

            "created_at":
                datetime.utcnow(),

            "updated_at":
                datetime.utcnow()
        }

        # =====================================================
        # 18. SAVE APPLICATION
        # =====================================================

        result = application_collection.insert_one(
            application
        )

        # =====================================================
        # 19. RESPONSE
        # =====================================================

        return {

            "success": True,

            "message":
                "Application Submitted Successfully.",

            "application_id":
                str(result.inserted_id),

            "resume_score":
                resume_score,

            "jd_match_score":
                jd_match_score,

            "matched_skills":
                matched_skills,

            "missing_skills":
                missing_skills
        }

    # =========================================================
    # GET ALL APPLICATIONS
    # =========================================================

    @staticmethod
    def get_all_applications():

        applications = []

        for application in application_collection.find().sort(
            "created_at",
            -1
        ):

            application["_id"] = str(
                application["_id"]
            )

            application["student_id"] = str(
                application["student_id"]
            )

            application["organization_id"] = str(
                application["organization_id"]
            )

            application["job_id"] = str(
                application["job_id"]
            )

            application["resume_id"] = str(
                application["resume_id"]
            )

            applications.append(application)

        return applications

    # =========================================================
    # GET APPLICATION BY ID
    # =========================================================

    @staticmethod
    def get_application(application_id: str):

        if not ObjectId.is_valid(application_id):

            raise HTTPException(
                status_code=400,
                detail="Invalid Application ID."
            )

        application = application_collection.find_one(
            {
                "_id": ObjectId(application_id)
            }
        )

        if not application:

            raise HTTPException(
                status_code=404,
                detail="Application not found."
            )

        # Mark as viewed
        application_collection.update_one(
            {
                "_id": ObjectId(application_id)
            },
            {
                "$set": {
                    "viewed_by_recruiter": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        application["_id"] = str(
            application["_id"]
        )

        application["student_id"] = str(
            application["student_id"]
        )

        application["organization_id"] = str(
            application["organization_id"]
        )

        application["job_id"] = str(
            application["job_id"]
        )

        application["resume_id"] = str(
            application["resume_id"]
        )

        return application

    # =========================================================
    # GET STUDENT APPLICATIONS
    # =========================================================

    @staticmethod
    def get_student_applications(
        student_id: str
    ):

        if not ObjectId.is_valid(student_id):

            raise HTTPException(
                status_code=400,
                detail="Invalid Student ID."
            )

        applications = []

        for application in application_collection.find(
            {
                "student_id":
                    ObjectId(student_id)
            }
        ).sort(
            "created_at",
            -1
        ):

            application["_id"] = str(
                application["_id"]
            )

            application["student_id"] = str(
                application["student_id"]
            )

            application["organization_id"] = str(
                application["organization_id"]
            )

            application["job_id"] = str(
                application["job_id"]
            )

            application["resume_id"] = str(
                application["resume_id"]
            )

            applications.append(application)

        return applications

    # =========================================================
    # GET ORGANIZATION APPLICATIONS
    # =========================================================

    @staticmethod
    def get_organization_applications(
        organization_id: str
    ):

        if not ObjectId.is_valid(
            organization_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid Organization ID."
            )

        applications = []

        for application in application_collection.find(
            {
                "organization_id":
                    ObjectId(organization_id)
            }
        ).sort(
            "created_at",
            -1
        ):

            application["_id"] = str(
                application["_id"]
            )

            application["student_id"] = str(
                application["student_id"]
            )

            application["organization_id"] = str(
                application["organization_id"]
            )

            application["job_id"] = str(
                application["job_id"]
            )

            application["resume_id"] = str(
                application["resume_id"]
            )

            applications.append(application)

        return applications

    # =========================================================
    # GET JOB APPLICATIONS
    # =========================================================

    @staticmethod
    def get_job_applications(
        job_id: str
    ):

        if not ObjectId.is_valid(job_id):

            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        applications = []

        for application in application_collection.find(
            {
                "job_id":
                    ObjectId(job_id)
            }
        ).sort(
            "created_at",
            -1
        ):

            application["_id"] = str(
                application["_id"]
            )

            application["student_id"] = str(
                application["student_id"]
            )

            application["organization_id"] = str(
                application["organization_id"]
            )

            application["job_id"] = str(
                application["job_id"]
            )

            application["resume_id"] = str(
                application["resume_id"]
            )

            applications.append(application)

        return applications

    # =========================================================
    # UPDATE APPLICATION STATUS
    # =========================================================

    @staticmethod
    def update_application_status(
        application_id: str,
        data: ApplicationUpdate
    ):

        if not ObjectId.is_valid(
            application_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid Application ID."
            )

        existing_application = application_collection.find_one(
            {
                "_id":
                    ObjectId(application_id)
            }
        )

        if not existing_application:

            raise HTTPException(
                status_code=404,
                detail="Application not found."
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        update_data["updated_at"] = (
            datetime.utcnow()
        )

        result = application_collection.update_one(
            {
                "_id":
                    ObjectId(application_id)
            },
            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Application not found."
            )

        return {

            "success": True,

            "message":
                "Application Updated Successfully."
        }

    # =========================================================
    # DELETE APPLICATION
    # =========================================================

    @staticmethod
    def delete_application(
        application_id: str
    ):

        if not ObjectId.is_valid(
            application_id
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid Application ID."
            )

        existing_application = application_collection.find_one(
            {
                "_id":
                    ObjectId(application_id)
            }
        )

        if not existing_application:

            raise HTTPException(
                status_code=404,
                detail="Application not found."
            )

        result = application_collection.delete_one(
            {
                "_id":
                    ObjectId(application_id)
            }
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Application not found."
            )

        return {

            "success": True,

            "message":
                "Application Deleted Successfully."
        }
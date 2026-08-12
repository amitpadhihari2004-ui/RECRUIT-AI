from bson import ObjectId
from fastapi import HTTPException

from app.models.resume_model import resume_collection
from app.models.job_model import job_collection
from app.models.organization_model import organization_collection
from app.services.groq_service import GroqService


class RecommendationService:

    @staticmethod
    def get_recommended_jobs(
        user_id: str,
        limit: int = 5
    ):
        """
        Generate AI-based job recommendations
        according to the student's latest analyzed resume.
        """

        try:

            # =====================================================
            # 1. Validate User ID
            # =====================================================

            if not ObjectId.is_valid(user_id):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid User ID."
                )

            user_object_id = ObjectId(user_id)

            print("\n======================================")
            print("AI JOB RECOMMENDATION")
            print("User ID:", user_id)
            print("======================================")

            # =====================================================
            # 2. Validate Limit
            # =====================================================

            try:
                limit = int(limit)
            except (TypeError, ValueError):
                limit = 5

            limit = max(1, min(limit, 10))

            # =====================================================
            # 3. Get Latest Completed Resume
            # =====================================================

            resume = resume_collection.find_one(
                {
                    "user_id": user_object_id,
                    "analysis_status": "Completed",
                    "analysis": {
                        "$exists": True,
                        "$ne": None
                    }
                },
                sort=[
                    ("created_at", -1)
                ]
            )

            if not resume:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "No analyzed resume found. "
                        "Please upload and analyze a resume first."
                    )
                )

            print(
                "Resume found:",
                str(resume["_id"])
            )

            # =====================================================
            # 4. Get Resume Analysis
            # =====================================================

            resume_analysis = resume.get(
                "analysis",
                {}
            )

            if not isinstance(
                resume_analysis,
                dict
            ) or not resume_analysis:

                raise HTTPException(
                    status_code=404,
                    detail="Resume analysis not found."
                )

            print("Resume analysis found.")

            # =====================================================
            # 5. Get Published Jobs
            # =====================================================

            jobs_cursor = job_collection.find(
                {
                    "status": "Published"
                }
            ).sort(
                "created_at",
                -1
            )

            jobs = []

            for job in jobs_cursor:

                organization_id = job.get(
                    "organization_id"
                )

                # Skip invalid jobs
                if not organization_id:
                    continue

                # Convert organization ID safely
                if isinstance(
                    organization_id,
                    str
                ):

                    if not ObjectId.is_valid(
                        organization_id
                    ):
                        continue

                    organization_id = ObjectId(
                        organization_id
                    )

                # Get organization
                organization = organization_collection.find_one(
                    {
                        "_id": organization_id
                    }
                )

                jobs.append(
                    {
                        "job_id": str(
                            job["_id"]
                        ),

                        "organization_id": str(
                            organization_id
                        ),

                        "company_name": (
                            organization.get(
                                "company_name",
                                ""
                            )
                            if organization
                            else ""
                        ),

                        "title": job.get(
                            "title",
                            ""
                        ),

                        "department": job.get(
                            "department",
                            ""
                        ),

                        "location": job.get(
                            "location",
                            ""
                        ),

                        "employment_type": job.get(
                            "employment_type",
                            ""
                        ),

                        "experience_required": job.get(
                            "experience_required",
                            ""
                        ),

                        "salary": job.get(
                            "salary",
                            ""
                        ),

                        "description": job.get(
                            "description",
                            ""
                        ),

                        "skills": job.get(
                            "skills",
                            []
                        ),

                        "requirements": job.get(
                            "requirements",
                            []
                        )
                    }
                )

            print(
                "Published jobs found:",
                len(jobs)
            )

            # =====================================================
            # 6. No Published Jobs
            # =====================================================

            if not jobs:

                return {
                    "success": True,
                    "resume_id": str(
                        resume["_id"]
                    ),
                    "resume_file_name": resume.get(
                        "file_name",
                        ""
                    ),
                    "resume_score": resume_analysis.get(
                        "resume_score",
                        0
                    ),
                    "count": 0,
                    "recommendations": []
                }

            # =====================================================
            # 7. Limit Jobs Sent To AI
            # =====================================================

            jobs_for_ai = jobs[:20]

            print(
                "Jobs sent to Groq:",
                len(jobs_for_ai)
            )

            # =====================================================
            # 8. Ask Groq AI
            # =====================================================

            print(
                "Calling Groq recommendation engine..."
            )

            ai_result = GroqService.recommend_jobs(
                resume_analysis=resume_analysis,
                jobs=jobs_for_ai,
                limit=limit
            )

            print(
                "Groq recommendation completed."
            )

            # =====================================================
            # 9. Validate AI Response
            # =====================================================

            if not isinstance(
                ai_result,
                list
            ):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "AI returned an invalid "
                        "recommendation format."
                    )
                )

            # =====================================================
            # 10. Job Lookup
            # =====================================================

            job_lookup = {
                job["job_id"]: job
                for job in jobs_for_ai
            }

            recommendations = []

            # =====================================================
            # 11. Process AI Results
            # =====================================================

            for recommendation in ai_result:

                if not isinstance(
                    recommendation,
                    dict
                ):
                    continue

                # -------------------------------------------------
                # Job ID
                # -------------------------------------------------

                job_id = str(
                    recommendation.get(
                        "job_id",
                        ""
                    )
                ).strip()

                if not job_id:
                    continue

                # -------------------------------------------------
                # Prevent AI hallucinated jobs
                # -------------------------------------------------

                job = job_lookup.get(
                    job_id
                )

                if not job:
                    print(
                        "Ignoring unknown AI job:",
                        job_id
                    )
                    continue

                # -------------------------------------------------
                # Match Score
                # -------------------------------------------------

                match_score = recommendation.get(
                    "match_score",
                    0
                )

                try:
                    match_score = int(
                        float(match_score)
                    )
                except (
                    ValueError,
                    TypeError
                ):
                    match_score = 0

                match_score = max(
                    0,
                    min(
                        100,
                        match_score
                    )
                )

                # -------------------------------------------------
                # Matched Skills
                # -------------------------------------------------

                matched_skills = recommendation.get(
                    "matched_skills",
                    []
                )

                if not isinstance(
                    matched_skills,
                    list
                ):
                    matched_skills = []

                # Remove duplicates
                matched_skills = list(
                    dict.fromkeys(
                        str(skill).strip()
                        for skill in matched_skills
                        if str(skill).strip()
                    )
                )

                # -------------------------------------------------
                # Missing Skills
                # -------------------------------------------------

                missing_skills = recommendation.get(
                    "missing_skills",
                    []
                )

                if not isinstance(
                    missing_skills,
                    list
                ):
                    missing_skills = []

                missing_skills = list(
                    dict.fromkeys(
                        str(skill).strip()
                        for skill in missing_skills
                        if str(skill).strip()
                    )
                )

                # -------------------------------------------------
                # Recommendation Reason
                # -------------------------------------------------

                reason = recommendation.get(
                    "recommendation_reason",
                    "This job matches your resume."
                )

                if not isinstance(
                    reason,
                    str
                ) or not reason.strip():

                    reason = (
                        "This job matches your resume."
                    )

                # -------------------------------------------------
                # Final Recommendation
                # -------------------------------------------------

                recommendations.append(
                    {
                        "job_id": job["job_id"],

                        "organization_id": job[
                            "organization_id"
                        ],

                        "title": job[
                            "title"
                        ],

                        "company_name": job[
                            "company_name"
                        ],

                        "department": job[
                            "department"
                        ],

                        "location": job[
                            "location"
                        ],

                        "employment_type": job[
                            "employment_type"
                        ],

                        "experience_required": job[
                            "experience_required"
                        ],

                        "salary": job[
                            "salary"
                        ],

                        "description": job[
                            "description"
                        ],

                        "skills": job[
                            "skills"
                        ],

                        "requirements": job[
                            "requirements"
                        ],

                        "match_score": match_score,

                        "matched_skills": matched_skills,

                        "missing_skills": missing_skills,

                        "recommendation_reason": reason
                    }
                )

            # =====================================================
            # 12. Remove Duplicate Jobs
            # =====================================================

            unique_recommendations = []

            seen_job_ids = set()

            for recommendation in recommendations:

                job_id = recommendation[
                    "job_id"
                ]

                if job_id in seen_job_ids:
                    continue

                seen_job_ids.add(
                    job_id
                )

                unique_recommendations.append(
                    recommendation
                )

            # =====================================================
            # 13. Sort By Match Score
            # =====================================================

            unique_recommendations.sort(
                key=lambda x: x[
                    "match_score"
                ],
                reverse=True
            )

            # =====================================================
            # 14. Apply Limit
            # =====================================================

            unique_recommendations = (
                unique_recommendations[:limit]
            )

            print(
                "Final recommendations:",
                len(unique_recommendations)
            )

            # =====================================================
            # 15. Return Response
            # =====================================================

            return {
                "success": True,

                "resume_id": str(
                    resume["_id"]
                ),

                "resume_file_name": resume.get(
                    "file_name",
                    ""
                ),

                "resume_score": resume_analysis.get(
                    "resume_score",
                    0
                ),

                "count": len(
                    unique_recommendations
                ),

                "recommendations": (
                    unique_recommendations
                )
            }

        except HTTPException:
            raise

        except Exception as e:

            print("\n======================================")
            print("RECOMMENDATION SERVICE ERROR")
            print("ERROR TYPE:", type(e).__name__)
            print("ERROR:", str(e))
            print("======================================\n")

            raise HTTPException(
                status_code=500,
                detail=(
                    "Recommendation service failed: "
                    + str(e)
                )
            )
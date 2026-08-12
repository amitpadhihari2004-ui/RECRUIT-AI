import json
from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException

from app.models.resume_model import resume_collection
from app.models.job_model import job_collection
from app.models.jd_matching_model import jd_matching_collection

from app.services.groq_service import client


class JDMatchingService:

    # =========================================================
    # MATCH RESUME WITH JOB
    # =========================================================

    @staticmethod
    def match_resume_with_job(
        resume_id: str,
        job_id: str
    ):

        # =====================================================
        # 1. Validate IDs
        # =====================================================

        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Resume ID."
            )

        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        resume_object_id = ObjectId(resume_id)
        job_object_id = ObjectId(job_id)

        # =====================================================
        # 2. Get Resume
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
        # 3. Get Student ID
        # =====================================================

        student_id = resume.get("user_id")

        if not student_id:
            raise HTTPException(
                status_code=400,
                detail="Resume has no associated student."
            )

        # =====================================================
        # 4. Check Resume Analysis
        # =====================================================

        if resume.get("analysis_status") != "Completed":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Resume must be analyzed "
                    "before JD matching."
                )
            )

        analysis = resume.get("analysis")

        if not isinstance(analysis, dict) or not analysis:
            raise HTTPException(
                status_code=400,
                detail="Resume analysis not found."
            )

        # =====================================================
        # 5. Get Job
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
        # 6. Check Job Status
        # =====================================================

        if job.get("status") != "Published":
            raise HTTPException(
                status_code=400,
                detail="This job is not accepting applications."
            )

        # =====================================================
        # 7. Check Existing Match
        # =====================================================

        existing_match = jd_matching_collection.find_one(
            {
                "resume_id": resume_object_id,
                "job_id": job_object_id
            }
        )

        if existing_match:

            return {
                "success": True,
                "cached": True,
                "message": "JD matching result already exists.",
                "data": JDMatchingService._serialize_match(
                    existing_match
                )
            }

        # =====================================================
        # 8. Prepare Resume Data
        # =====================================================

        resume_data = {
            "skills": analysis.get("skills", []),
            "soft_skills": analysis.get("soft_skills", []),
            "education": analysis.get("education", []),
            "experience": analysis.get("experience", []),
            "projects": analysis.get("projects", []),
            "certifications": analysis.get("certifications", []),
            "languages": analysis.get("languages", []),
            "resume_score": analysis.get("resume_score", 0)
        }

        # =====================================================
        # 9. Prepare Job Data
        # =====================================================

        job_data = {
            "title": job.get("title", ""),
            "department": job.get("department", ""),
            "location": job.get("location", ""),
            "employment_type": job.get("employment_type", ""),
            "experience_required": job.get(
                "experience_required",
                ""
            ),
            "skills": job.get("skills", []),
            "requirements": job.get("requirements", []),
            "description": job.get("description", "")
        }

        # =====================================================
        # 10. AI Prompt
        # =====================================================

        prompt = f"""
You are Recruit AI's professional ATS Job Matching Engine.

Compare ONE candidate resume with ONE job.

Analyze objectively and consistently.

IMPORTANT RULES:

1. Analyze ONLY information present in the resume.
2. Never invent candidate skills.
3. Never invent candidate experience.
4. Never invent education.
5. Never invent projects.
6. Never invent certifications.
7. Do not consider gender, age, nationality, religion,
   photograph or other unrelated personal information.
8. Evaluate specifically for this job.
9. Return ONLY valid JSON.
10. Do NOT return markdown.

==================================================
MATCHING CRITERIA
==================================================

Evaluate:

- Technical skill match
- Required skill match
- Experience relevance
- Education relevance
- Project relevance
- Certification relevance
- Job description relevance
- Career alignment

==================================================
MATCH SCORE
==================================================

Return an INTEGER from 0 to 100.

90-100 = Excellent Match
80-89  = Strong Match
70-79  = Good Match
60-69  = Moderate Match
40-59  = Weak Match
0-39   = Very Weak Match

A high score requires strong evidence.

==================================================
MATCHED SKILLS
==================================================

Only include skills that:

1. Exist in the resume
AND
2. Are relevant to the job.

==================================================
MISSING SKILLS
==================================================

Only include skills that:

1. Are required or strongly preferred by the job
AND
2. Are not present in the resume.

==================================================
STRENGTHS
==================================================

Provide 2-5 specific strengths for this job.

==================================================
RECOMMENDATIONS
==================================================

Provide practical improvements.

==================================================
OUTPUT
==================================================

Return exactly:

{{
    "match_percentage": 0,
    "matched_skills": [],
    "missing_skills": [],
    "strengths": [],
    "recommendations": [],
    "overall_feedback": ""
}}

==================================================
CANDIDATE
==================================================

{json.dumps(
    resume_data,
    ensure_ascii=False
)}

==================================================
JOB
==================================================

{json.dumps(
    job_data,
    ensure_ascii=False
)}
"""

        # =====================================================
        # 11. Call Groq
        # =====================================================

        try:

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are Recruit AI's deterministic "
                            "ATS job matching engine. "
                            "Return ONLY valid JSON."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0,
                max_tokens=2048
            )

            response = (
                completion
                .choices[0]
                .message
                .content
                .strip()
            )

            response = (
                response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            result = json.loads(response)

        except json.JSONDecodeError:

            raise HTTPException(
                status_code=500,
                detail="Groq returned invalid JSON."
            )

        except Exception as e:

            print("JD Matching Groq Error:", str(e))

            raise HTTPException(
                status_code=500,
                detail=f"JD matching failed: {str(e)}"
            )

        # =====================================================
        # 12. Validate AI Result
        # =====================================================

        if not isinstance(result, dict):

            raise HTTPException(
                status_code=500,
                detail="AI returned invalid JD matching data."
            )

        # =====================================================
        # 13. Match Percentage
        # =====================================================

        try:
            match_percentage = int(
                result.get("match_percentage", 0)
            )
        except (TypeError, ValueError):
            match_percentage = 0

        match_percentage = max(
            0,
            min(100, match_percentage)
        )

        # =====================================================
        # 14. Validate Lists
        # =====================================================

        list_fields = [
            "matched_skills",
            "missing_skills",
            "strengths",
            "recommendations"
        ]

        for field in list_fields:

            if not isinstance(
                result.get(field),
                list
            ):
                result[field] = []

        # =====================================================
        # 15. Validate Feedback
        # =====================================================

        if not isinstance(
            result.get("overall_feedback"),
            str
        ):
            result["overall_feedback"] = (
                "Candidate evaluated against the selected job."
            )

        # =====================================================
        # 16. Save Separate Match Document
        # =====================================================

        match_data = {

            "resume_id": resume_object_id,

            "job_id": job_object_id,

            "student_id": student_id,

            "match_percentage": match_percentage,

            "matched_skills": result[
                "matched_skills"
            ],

            "missing_skills": result[
                "missing_skills"
            ],

            "strengths": result[
                "strengths"
            ],

            "recommendations": result[
                "recommendations"
            ],

            "overall_feedback": result[
                "overall_feedback"
            ],

            "created_at": datetime.utcnow(),

            "updated_at": datetime.utcnow()
        }

        insert_result = jd_matching_collection.insert_one(
            match_data
        )

        # =====================================================
        # 17. Return Result
        # =====================================================

        return {

            "success": True,

            "cached": False,

            "message": (
                "JD Matching completed successfully."
            ),

            "data": {

                "id": str(
                    insert_result.inserted_id
                ),

                "resume_id": resume_id,

                "job_id": job_id,

                "student_id": str(
                    student_id
                ),

                "match_percentage":
                    match_percentage,

                "matched_skills":
                    result["matched_skills"],

                "missing_skills":
                    result["missing_skills"],

                "strengths":
                    result["strengths"],

                "recommendations":
                    result["recommendations"],

                "overall_feedback":
                    result["overall_feedback"]
            }
        }

    # =========================================================
    # GET MATCH BY ID
    # =========================================================

    @staticmethod
    def get_match_result(match_id: str):

        if not ObjectId.is_valid(match_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Match ID."
            )

        match = jd_matching_collection.find_one(
            {"_id": ObjectId(match_id)}
        )

        if not match:
            raise HTTPException(
                status_code=404,
                detail="JD match result not found."
            )

        return {
            "success": True,
            "data": JDMatchingService._serialize_match(
                match
            )
        }

    # =========================================================
    # GET ALL MATCH RESULTS
    # =========================================================

    @staticmethod
    def get_all_match_results():

        matches = []

        for match in jd_matching_collection.find().sort(
            "created_at",
            -1
        ):

            matches.append(
                JDMatchingService._serialize_match(
                    match
                )
            )

        return {
            "success": True,
            "count": len(matches),
            "matches": matches
        }

    # =========================================================
    # GET MATCHES BY STUDENT
    # =========================================================

    @staticmethod
    def get_matches_by_student(
        student_id: str
    ):

        if not ObjectId.is_valid(student_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Student ID."
            )

        matches = []

        cursor = jd_matching_collection.find(
            {
                "student_id": ObjectId(student_id)
            }
        ).sort(
            "created_at",
            -1
        )

        for match in cursor:

            matches.append(
                JDMatchingService._serialize_match(
                    match
                )
            )

        return {
            "success": True,
            "student_id": student_id,
            "count": len(matches),
            "matches": matches
        }

    # =========================================================
    # GET MATCHES BY JOB
    # =========================================================

    @staticmethod
    def get_matches_by_job(
        job_id: str
    ):

        if not ObjectId.is_valid(job_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Job ID."
            )

        matches = []

        cursor = jd_matching_collection.find(
            {
                "job_id": ObjectId(job_id)
            }
        ).sort(
            "match_percentage",
            -1
        )

        for match in cursor:

            matches.append(
                JDMatchingService._serialize_match(
                    match
                )
            )

        return {
            "success": True,
            "job_id": job_id,
            "count": len(matches),
            "matches": matches
        }

    # =========================================================
    # DELETE MATCH
    # =========================================================

    @staticmethod
    def delete_match_result(
        match_id: str
    ):

        if not ObjectId.is_valid(match_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid Match ID."
            )

        result = jd_matching_collection.delete_one(
            {
                "_id": ObjectId(match_id)
            }
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="JD match result not found."
            )

        return {
            "success": True,
            "message": (
                "JD match result deleted successfully."
            )
        }

    # =========================================================
    # SERIALIZE
    # =========================================================

    @staticmethod
    def _serialize_match(match):

        return {

            "id": str(
                match["_id"]
            ),

            "resume_id": str(
                match["resume_id"]
            ),

            "job_id": str(
                match["job_id"]
            ),

            "student_id": str(
                match["student_id"]
            ),

            "match_percentage": match.get(
                "match_percentage",
                0
            ),

            "matched_skills": match.get(
                "matched_skills",
                []
            ),

            "missing_skills": match.get(
                "missing_skills",
                []
            ),

            "strengths": match.get(
                "strengths",
                []
            ),

            "recommendations": match.get(
                "recommendations",
                []
            ),

            "overall_feedback": match.get(
                "overall_feedback",
                ""
            ),

            "created_at": match.get(
                "created_at"
            ),

            "updated_at": match.get(
                "updated_at"
            )
        }
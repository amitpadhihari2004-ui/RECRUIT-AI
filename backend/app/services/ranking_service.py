from datetime import datetime
from typing import List, Dict, Any

from bson import ObjectId
from fastapi import HTTPException, status

from app.models.ranking_model import ranking_collection
from app.models.application_model import application_collection
from app.models.resume_model import resume_collection
from app.models.jd_matching_model import jd_matching_collection
from app.models.interview_model import interview_collection
from app.models.monitoring_model import monitoring_collection
from app.models.job_model import job_collection
from app.models.user_model import user_collection


class RankingService:

    # =========================================================
    # SCORE WEIGHTS
    # =========================================================

    FULL_WEIGHTS = {
        "resume_score": 0.30,
        "jd_match_score": 0.30,
        "interview_score": 0.25,
        "integrity_score": 0.15,
    }

    CURRENT_STAGE_WEIGHTS = {
        "resume_score": 0.40,
        "jd_match_score": 0.60,
    }

    # =========================================================
    # RECOMMENDATION THRESHOLDS
    # =========================================================

    RECOMMENDATION_THRESHOLDS = {
        "highly_recommended": 90,
        "recommended": 80,
        "consider": 70,
        "average": 60,
    }

    # =========================================================
    # DECISION THRESHOLDS
    # =========================================================

    DECISION_THRESHOLDS = {
        "selected": 90,
        "shortlisted": 80,
        "under_review": 70,
        "consider": 60,
    }

    # =========================================================
    # ALLOWED DECISIONS
    # =========================================================

    ALLOWED_DECISIONS = {
        "Selected",
        "Shortlisted",
        "Under Review",
        "Consider",
        "Rejected",
    }

    # =========================================================
    # VALIDATE OBJECT ID
    # =========================================================

    @staticmethod
    def _validate_object_id(
        id_string: str,
        field_name: str
    ) -> ObjectId:

        if not id_string or not ObjectId.is_valid(
            str(id_string)
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {field_name} ID format."
            )

        return ObjectId(str(id_string))

    # =========================================================
    # CONVERT OBJECT IDS
    # =========================================================

    @staticmethod
    def _convert_object_ids(
        document: Dict[str, Any]
    ) -> Dict[str, Any]:

        if not document:
            return document

        converted = {}

        for key, value in document.items():

            if isinstance(value, ObjectId):

                converted[key] = str(value)

            elif isinstance(value, list):

                converted[key] = [
                    str(item)
                    if isinstance(item, ObjectId)
                    else item
                    for item in value
                ]

            elif isinstance(value, dict):

                converted[key] = (
                    RankingService._convert_object_ids(
                        value
                    )
                )

            else:

                converted[key] = value

        return converted

    # =========================================================
    # GET DOCUMENT OR 404
    # =========================================================

    @staticmethod
    def _get_document_or_404(
        collection,
        document_id: ObjectId,
        document_type: str
    ):

        document = collection.find_one(
            {
                "_id": document_id
            }
        )

        if not document:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{document_type} not found."
            )

        return document

    # =========================================================
    # SAFE SCORE
    # =========================================================

    @staticmethod
    def _safe_score(
        value: Any
    ) -> float:

        try:

            score = float(
                value or 0
            )

        except (
            TypeError,
            ValueError
        ):

            score = 0

        return max(
            0,
            min(
                100,
                score
            )
        )

    # =========================================================
    # GET JOB APPLICATIONS
    # =========================================================

    @staticmethod
    def _get_job_applications(
        job_id: str,
        job_object_id: ObjectId
    ) -> List[Dict[str, Any]]:

        applications = list(
            application_collection.find(
                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }
            )
        )

        # =====================================================
        # REMOVE DUPLICATES
        # =====================================================

        unique_applications = {}

        for application in applications:

            application_id = application.get(
                "_id"
            )

            if application_id:

                unique_applications[
                    str(application_id)
                ] = application

        return list(
            unique_applications.values()
        )

    # =========================================================
    # GET RESUME
    # =========================================================

    @staticmethod
    def _get_resume(
        resume_id
    ):

        if not resume_id:
            return None

        queries = [
            {
                "_id": resume_id
            }
        ]

        if ObjectId.is_valid(
            str(resume_id)
        ):

            queries.append(
                {
                    "_id":
                        ObjectId(
                            str(resume_id)
                        )
                }
            )

        for query in queries:

            resume = resume_collection.find_one(
                query
            )

            if resume:

                return resume

        return None

    # =========================================================
    # GET JD MATCH
    # =========================================================

    @staticmethod
    def _get_jd_match(
        resume_id,
        job_id
    ) -> Dict[str, Any]:

        if not resume_id or not job_id:

            return {
                "match_percentage": 0,
                "matched_skills": [],
                "missing_skills": [],
            }

        resume_values = [
            resume_id,
            str(resume_id),
        ]

        job_values = [
            job_id,
            str(job_id),
        ]

        if ObjectId.is_valid(
            str(resume_id)
        ):

            resume_values.append(
                ObjectId(
                    str(resume_id)
                )
            )

        if ObjectId.is_valid(
            str(job_id)
        ):

            job_values.append(
                ObjectId(
                    str(job_id)
                )
            )

        # =====================================================
        # TRY ALL VALID COMBINATIONS
        # =====================================================

        match = None

        for resume_value in resume_values:

            for job_value in job_values:

                match = (
                    jd_matching_collection.find_one(
                        {
                            "resume_id":
                                resume_value,

                            "job_id":
                                job_value,
                        },
                        sort=[
                            (
                                "created_at",
                                -1
                            )
                        ]
                    )
                )

                if match:

                    break

            if match:

                break

        if not match:

            return {
                "match_percentage": 0,
                "matched_skills": [],
                "missing_skills": [],
            }

        return {

            "match_percentage":
                RankingService._safe_score(
                    match.get(
                        "match_percentage",
                        match.get(
                            "score",
                            0
                        )
                    )
                ),

            "matched_skills":
                match.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                match.get(
                    "missing_skills",
                    []
                ),
        }

    # =========================================================
    # GET INTERVIEW
    # =========================================================

    @staticmethod
    def _get_interview(
        application_id
    ):

        if not application_id:
            return None

        status_values = [
            "Completed",
            "Evaluated",
            "completed",
            "evaluated",
        ]

        queries = [

            {
                "application_id":
                    application_id,

                "status":
                    {
                        "$in":
                            status_values
                    }
            }

        ]

        if ObjectId.is_valid(
            str(application_id)
        ):

            queries.append(

                {
                    "application_id":
                        str(application_id),

                    "status":
                        {
                            "$in":
                                status_values
                        }
                }

            )

        for query in queries:

            interview = (
                interview_collection.find_one(
                    query,
                    sort=[
                        (
                            "created_at",
                            -1
                        )
                    ]
                )
            )

            if interview:

                return interview

        return None

    # =========================================================
    # GET MONITORING
    # =========================================================

    @staticmethod
    def _get_monitoring(
        interview_id
    ):

        if not interview_id:

            return None

        queries = [

            {
                "interview_id":
                    interview_id
            }

        ]

        if ObjectId.is_valid(
            str(interview_id)
        ):

            queries.append(

                {
                    "interview_id":
                        str(interview_id)
                }

            )

        for query in queries:

            monitoring = (
                monitoring_collection.find_one(
                    query,
                    sort=[
                        (
                            "created_at",
                            -1
                        )
                    ]
                )
            )

            if monitoring:

                return monitoring

        return None

    # =========================================================
    # CALCULATE FINAL SCORE
    # =========================================================

    @staticmethod
    def _calculate_final_score(
        resume_score: float,
        jd_match_score: float,
        interview_score: float,
        integrity_score: float,
        interview_available: bool,
        integrity_available: bool
    ) -> int:

        resume_score = (
            RankingService._safe_score(
                resume_score
            )
        )

        jd_match_score = (
            RankingService._safe_score(
                jd_match_score
            )
        )

        interview_score = (
            RankingService._safe_score(
                interview_score
            )
        )

        integrity_score = (
            RankingService._safe_score(
                integrity_score
            )
        )

        # =====================================================
        # STAGE 1
        #
        # Resume 40%
        # JD Match 60%
        # =====================================================

        if not interview_available:

            final_score = (

                resume_score * 0.40

                +

                jd_match_score * 0.60

            )

        # =====================================================
        # STAGE 2
        #
        # Resume 30%
        # JD 30%
        # Interview 25%
        #
        # Normalize because integrity is unavailable.
        # =====================================================

        elif not integrity_available:

            total_weight = (
                0.30
                +
                0.30
                +
                0.25
            )

            final_score = (

                resume_score
                * (
                    0.30
                    /
                    total_weight
                )

                +

                jd_match_score
                * (
                    0.30
                    /
                    total_weight
                )

                +

                interview_score
                * (
                    0.25
                    /
                    total_weight
                )

            )

        # =====================================================
        # STAGE 3
        #
        # Resume 30%
        # JD 30%
        # Interview 25%
        # Integrity 15%
        # =====================================================

        else:

            weights = (
                RankingService.FULL_WEIGHTS
            )

            final_score = (

                resume_score
                * weights[
                    "resume_score"
                ]

                +

                jd_match_score
                * weights[
                    "jd_match_score"
                ]

                +

                interview_score
                * weights[
                    "interview_score"
                ]

                +

                integrity_score
                * weights[
                    "integrity_score"
                ]

            )

        return int(
            round(
                max(
                    0,
                    min(
                        100,
                        final_score
                    )
                )
            )
        )

    # =========================================================
    # AI RECOMMENDATION
    # =========================================================

    @staticmethod
    def _get_recommendation(
        score: int
    ) -> str:

        score = int(
            RankingService._safe_score(
                score
            )
        )

        if score >= 90:

            return "Highly Recommended"

        if score >= 80:

            return "Recommended"

        if score >= 70:

            return "Consider"

        if score >= 60:

            return "Average"

        return "Not Recommended"

    # =========================================================
    # AUTOMATIC DECISION
    # =========================================================

    @staticmethod
    def _get_selection_status(
        score: int
    ) -> Dict[str, str]:

        score = int(
            RankingService._safe_score(
                score
            )
        )

        # =====================================================
        # 90 - 100
        # =====================================================

        if score >= 90:

            return {

                "status":
                    "Selected",

                "reason":
                    "Excellent overall candidate score. "
                    "Candidate strongly matches the job "
                    "requirements."

            }

        # =====================================================
        # 80 - 89
        # =====================================================

        if score >= 80:

            return {

                "status":
                    "Shortlisted",

                "reason":
                    "Strong candidate profile with a high "
                    "overall evaluation score."

            }

        # =====================================================
        # 70 - 79
        # =====================================================

        if score >= 70:

            return {

                "status":
                    "Under Review",

                "reason":
                    "Candidate has a reasonable overall score "
                    "and requires further review."

            }

        # =====================================================
        # 60 - 69
        # =====================================================

        if score >= 60:

            return {

                "status":
                    "Consider",

                "reason":
                    "Candidate meets some requirements but "
                    "has areas that require consideration."

            }

        # =====================================================
        # BELOW 60
        # =====================================================

        return {

            "status":
                "Rejected",

            "reason":
                "Overall candidate score is below the "
                "minimum recommended threshold."

        }

    # =========================================================
    # GET CANDIDATE DATA
    # =========================================================

    @staticmethod
    def _get_candidate_data(
        application
    ) -> Dict[str, Any]:

        application_id = (
            application.get(
                "_id"
            )
        )

        student_id = (
            application.get(
                "student_id"
            )
        )

        resume_id = (
            application.get(
                "resume_id"
            )
        )

        organization_id = (
            application.get(
                "organization_id"
            )
        )

        job_id = (
            application.get(
                "job_id"
            )
        )

        # =====================================================
        # DEFAULT SCORES
        # =====================================================

        resume_score = 0
        jd_match_score = 0
        interview_score = 0
        integrity_score = 0

        interview_id = None
        monitoring_id = None

        interview_available = False
        integrity_available = False

        matched_skills = []
        missing_skills = []

        # =====================================================
        # RESUME
        # =====================================================

        resume = (
            RankingService._get_resume(
                resume_id
            )
        )

        if resume:

            analysis = resume.get(
                "analysis",
                {}
            )

            if isinstance(
                analysis,
                dict
            ):

                resume_score = (
                    RankingService._safe_score(
                        analysis.get(
                            "resume_score",
                            analysis.get(
                                "score",
                                0
                            )
                        )
                    )
                )

        # =====================================================
        # JD MATCH
        # =====================================================

        jd_result = (
            RankingService._get_jd_match(
                resume_id,
                job_id
            )
        )

        jd_match_score = (
            jd_result[
                "match_percentage"
            ]
        )

        matched_skills = (
            jd_result[
                "matched_skills"
            ]
        )

        missing_skills = (
            jd_result[
                "missing_skills"
            ]
        )

        # =====================================================
        # APPLICATION JD FALLBACK
        # =====================================================

        if (
            jd_match_score == 0
            and application.get(
                "jd_match_score"
            ) is not None
        ):

            jd_match_score = (
                RankingService._safe_score(
                    application.get(
                        "jd_match_score"
                    )
                )
            )

        # =====================================================
        # INTERVIEW
        # =====================================================

        interview = (
            RankingService._get_interview(
                application_id
            )
        )

        if interview:

            interview_available = True

            interview_id = (
                interview.get(
                    "_id"
                )
            )

            interview_score = (
                RankingService._safe_score(
                    interview.get(
                        "overall_score",
                        interview.get(
                            "score",
                            0
                        )
                    )
                )
            )

        # =====================================================
        # MONITORING / INTEGRITY
        # =====================================================

        monitoring = (
            RankingService._get_monitoring(
                interview_id
            )
        )

        if monitoring:

            integrity_available = True

            monitoring_id = (
                monitoring.get(
                    "_id"
                )
            )

            integrity_score = (
                RankingService._safe_score(
                    monitoring.get(
                        "integrity_score",
                        monitoring.get(
                            "score",
                            0
                        )
                    )
                )
            )

        # =====================================================
        # CANDIDATE NAME
        # =====================================================

        candidate_name = (

            application.get(
                "student_name"
            )

            or

            application.get(
                "candidate_name"
            )

            or

            application.get(
                "name"
            )

            or

            ""
        )

        # =====================================================
        # CANDIDATE EMAIL
        # =====================================================

        candidate_email = (

            application.get(
                "student_email"
            )

            or

            application.get(
                "candidate_email"
            )

            or

            application.get(
                "email"
            )

            or

            ""
        )

        # =====================================================
        # FALLBACK USER
        # =====================================================

        if student_id:

            try:

                student = None

                if ObjectId.is_valid(
                    str(student_id)
                ):

                    student = (
                        user_collection.find_one(
                            {
                                "_id":
                                    ObjectId(
                                        str(
                                            student_id
                                        )
                                    )
                            }
                        )
                    )

                if not student:

                    student = (
                        user_collection.find_one(
                            {
                                "_id":
                                    student_id
                            }
                        )
                    )

                if student:

                    if not candidate_name:

                        candidate_name = (

                            student.get(
                                "full_name"
                            )

                            or

                            student.get(
                                "name"
                            )

                            or

                            ""
                        )

                    if not candidate_email:

                        candidate_email = (
                            student.get(
                                "email",
                                ""
                            )
                        )

            except Exception:

                pass

        # =====================================================
        # RETURN
        # =====================================================

        return {

            "student_id":
                student_id,

            "organization_id":
                organization_id,

            "job_id":
                job_id,

            "application_id":
                application_id,

            "resume_id":
                resume_id,

            "interview_id":
                interview_id,

            "monitoring_id":
                monitoring_id,

            "resume_score":
                resume_score,

            "jd_match_score":
                jd_match_score,

            "interview_score":
                interview_score,

            "integrity_score":
                integrity_score,

            "interview_available":
                interview_available,

            "integrity_available":
                integrity_available,

            "matched_skills":
                matched_skills,

            "missing_skills":
                missing_skills,

            "candidate_name":
                candidate_name,

            "candidate_email":
                candidate_email,
        }

    # =========================================================
    # GET EXISTING RECRUITER DECISIONS
    # =========================================================

    @staticmethod
    def _get_existing_recruiter_decisions(
        job_id: str,
        job_object_id: ObjectId
    ) -> Dict[str, Dict[str, Any]]:

        old_rankings = list(
            ranking_collection.find(
                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }
            )
        )

        decisions = {}

        for ranking in old_rankings:

            application_id = (
                ranking.get(
                    "application_id"
                )
            )

            selection_status = (
                ranking.get(
                    "selection_status"
                )
            )

            decision_source = (
                ranking.get(
                    "decision_source"
                )
            )

            if (
                application_id
                and selection_status
                and decision_source == "Recruiter"
            ):

                decisions[
                    str(application_id)
                ] = {

                    "selection_status":
                        selection_status,

                    "decision_source":
                        "Recruiter",

                    "decision_reason":
                        ranking.get(
                            "decision_reason",
                            "Decision manually updated by recruiter."
                        ),

                    "decision_at":
                        ranking.get(
                            "decision_at"
                        ),

                }

        return decisions

    # =========================================================
    # GENERATE RANKING
    # =========================================================

    @staticmethod
    def generate_ranking(
        job_id: str
    ) -> Dict[str, Any]:

        job_object_id = (
            RankingService._validate_object_id(
                job_id,
                "job"
            )
        )

        # =====================================================
        # VERIFY JOB
        # =====================================================

        job = (
            RankingService._get_document_or_404(
                job_collection,
                job_object_id,
                "Job"
            )
        )

        # =====================================================
        # GET ALL APPLICATIONS
        # =====================================================

        applications = (
            RankingService._get_job_applications(
                job_id,
                job_object_id
            )
        )

        print(
            "========================================"
        )

        print(
            "RANKING GENERATION"
        )

        print(
            "JOB:",
            job_id
        )

        print(
            "APPLICATIONS FOUND:",
            len(applications)
        )

        print(
            "========================================"
        )

        # =====================================================
        # NO APPLICATIONS
        # =====================================================

        if not applications:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No applications found for this job."
                )
            )

        # =====================================================
        # SAVE RECRUITER DECISIONS
        # =====================================================

        existing_recruiter_decisions = (
            RankingService._get_existing_recruiter_decisions(
                job_id,
                job_object_id
            )
        )

        # =====================================================
        # DELETE OLD RANKINGS
        #
        # Old rankings are deleted so duplicate records
        # are never created.
        #
        # Recruiter decisions were already saved above.
        # =====================================================

        ranking_collection.delete_many(
            {
                "$or": [

                    {
                        "job_id":
                            job_object_id
                    },

                    {
                        "job_id":
                            str(job_id)
                    },

                ]
            }
        )

        current_time = datetime.utcnow()

        ranking_list = []

        # =====================================================
        # PROCESS EVERY APPLICATION
        # =====================================================

        for application in applications:

            application_id = (
                application.get(
                    "_id"
                )
            )

            if not application_id:

                continue

            print(
                "Processing Application:",
                application_id
            )

            # =================================================
            # GET CANDIDATE DATA
            # =================================================

            candidate_data = (
                RankingService._get_candidate_data(
                    application
                )
            )

            # =================================================
            # CALCULATE FINAL SCORE
            # =================================================

            final_score = (
                RankingService._calculate_final_score(

                    resume_score=
                        candidate_data[
                            "resume_score"
                        ],

                    jd_match_score=
                        candidate_data[
                            "jd_match_score"
                        ],

                    interview_score=
                        candidate_data[
                            "interview_score"
                        ],

                    integrity_score=
                        candidate_data[
                            "integrity_score"
                        ],

                    interview_available=
                        candidate_data[
                            "interview_available"
                        ],

                    integrity_available=
                        candidate_data[
                            "integrity_available"
                        ],

                )
            )

            # =================================================
            # AI RECOMMENDATION
            # =================================================

            recommendation = (
                RankingService._get_recommendation(
                    final_score
                )
            )

            # =================================================
            # AI DECISION
            # =================================================

            automatic_decision = (
                RankingService._get_selection_status(
                    final_score
                )
            )

            # =================================================
            # DEFAULT AI DECISION
            # =================================================

            selection_status = (
                automatic_decision[
                    "status"
                ]
            )

            decision_reason = (
                automatic_decision[
                    "reason"
                ]
            )

            decision_source = "AI"

            decision_at = None

            # =================================================
            # RESTORE RECRUITER DECISION
            # =================================================

            previous_decision = (
                existing_recruiter_decisions.get(
                    str(application_id)
                )
            )

            if previous_decision:

                selection_status = (
                    previous_decision[
                        "selection_status"
                    ]
                )

                decision_reason = (
                    previous_decision[
                        "decision_reason"
                    ]
                )

                decision_source = "Recruiter"

                decision_at = (
                    previous_decision[
                        "decision_at"
                    ]
                )

            # =================================================
            # CREATE RANKING DOCUMENT
            # =================================================

            ranking_data = {

                "student_id":
                    candidate_data[
                        "student_id"
                    ],

                "candidate_name":
                    candidate_data[
                        "candidate_name"
                    ],

                "candidate_email":
                    candidate_data[
                        "candidate_email"
                    ],

                "organization_id":
                    candidate_data[
                        "organization_id"
                    ],

                "job_id":
                    job_object_id,

                "application_id":
                    application_id,

                "resume_id":
                    candidate_data[
                        "resume_id"
                    ],

                "interview_id":
                    candidate_data[
                        "interview_id"
                    ],

                "monitoring_id":
                    candidate_data[
                        "monitoring_id"
                    ],

                # ---------------------------------------------
                # SCORES
                # ---------------------------------------------

                "resume_score":
                    int(
                        round(
                            candidate_data[
                                "resume_score"
                            ]
                        )
                    ),

                "jd_match_score":
                    int(
                        round(
                            candidate_data[
                                "jd_match_score"
                            ]
                        )
                    ),

                "interview_score":
                    int(
                        round(
                            candidate_data[
                                "interview_score"
                            ]
                        )
                    ),

                "integrity_score":
                    int(
                        round(
                            candidate_data[
                                "integrity_score"
                            ]
                        )
                    ),

                "final_score":
                    final_score,

                # ---------------------------------------------
                # RANK
                # ---------------------------------------------

                "rank":
                    0,

                # ---------------------------------------------
                # AI RECOMMENDATION
                # ---------------------------------------------

                "recommendation":
                    recommendation,

                # ---------------------------------------------
                # DECISION
                # ---------------------------------------------

                "selection_status":
                    selection_status,

                "decision_reason":
                    decision_reason,

                "decision_source":
                    decision_source,

                "decision_at":
                    decision_at,

                # ---------------------------------------------
                # SKILLS
                # ---------------------------------------------

                "matched_skills":
                    candidate_data[
                        "matched_skills"
                    ],

                "missing_skills":
                    candidate_data[
                        "missing_skills"
                    ],

                # ---------------------------------------------
                # AVAILABILITY
                # ---------------------------------------------

                "interview_available":
                    candidate_data[
                        "interview_available"
                    ],

                "integrity_available":
                    candidate_data[
                        "integrity_available"
                    ],

                # ---------------------------------------------
                # TIMESTAMPS
                # ---------------------------------------------

                "created_at":
                    current_time,

                "updated_at":
                    current_time,
            }

            # =================================================
            # INSERT
            # =================================================

            result = (
                ranking_collection.insert_one(
                    ranking_data
                )
            )

            ranking_data[
                "_id"
            ] = result.inserted_id

            ranking_list.append(
                ranking_data
            )

        # =====================================================
        # NO VALID RANKINGS
        # =====================================================

        if not ranking_list:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Applications were found, but no "
                    "valid ranking records could be created."
                )
            )

        # =====================================================
        # SORT CANDIDATES
        # =====================================================

        ranking_list.sort(

            key=lambda item: (

                item.get(
                    "final_score",
                    0
                ),

                item.get(
                    "jd_match_score",
                    0
                ),

                item.get(
                    "resume_score",
                    0
                ),

                item.get(
                    "interview_score",
                    0
                ),

            ),

            reverse=True
        )

        # =====================================================
        # ASSIGN RANK
        # =====================================================

        for index, ranking in enumerate(
            ranking_list,
            start=1
        ):

            ranking["rank"] = index

            ranking_collection.update_one(

                {
                    "_id":
                        ranking["_id"]
                },

                {
                    "$set": {

                        "rank":
                            index,

                        "updated_at":
                            current_time,

                    }
                }
            )

        # =====================================================
        # GET FINAL RANKINGS
        # =====================================================

        final_rankings = list(

            ranking_collection.find(

                {
                    "job_id":
                        job_object_id
                }

            ).sort(

                "rank",
                1

            )

        )

        converted_rankings = [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in final_rankings

        ]

        # =====================================================
        # STATISTICS
        # =====================================================

        statistics = (
            RankingService._calculate_statistics(
                converted_rankings
            )
        )

        # =====================================================
        # RESPONSE
        # =====================================================

        return {

            "success":
                True,

            "message":
                "Candidate rankings generated successfully.",

            "job_id":
                job_id,

            "job_title":
                job.get(
                    "title",
                    ""
                ),

            "total_candidates":
                statistics[
                    "total_candidates"
                ],

            "selected":
                statistics[
                    "selected"
                ],

            "shortlisted":
                statistics[
                    "shortlisted"
                ],

            "under_review":
                statistics[
                    "under_review"
                ],

            "consider":
                statistics[
                    "consider"
                ],

            "rejected":
                statistics[
                    "rejected"
                ],

            "average_score":
                statistics[
                    "average_score"
                ],

            "rankings":
                converted_rankings,
        }

    # =========================================================
    # REGENERATE
    # =========================================================

    @staticmethod
    def regenerate_ranking(
        job_id: str
    ):

        return (
            RankingService.generate_ranking(
                job_id
            )
        )

    # =========================================================
    # GET RANKINGS BY JOB
    # =========================================================

    @staticmethod
    def get_rankings_by_job(
        job_id: str
    ):

        job_object_id = (
            RankingService._validate_object_id(
                job_id,
                "job"
            )
        )

        RankingService._get_document_or_404(
            job_collection,
            job_object_id,
            "Job"
        )

        rankings = list(

            ranking_collection.find(

                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }

            ).sort(

                "rank",
                1

            )

        )

        return [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in rankings

        ]

    # =========================================================
    # GET ALL RANKINGS
    # =========================================================

    @staticmethod
    def get_all_rankings():

        rankings = list(

            ranking_collection.find().sort(

                "created_at",
                -1

            )

        )

        return [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in rankings

        ]

    # =========================================================
    # GET SINGLE RANKING
    # =========================================================

    @staticmethod
    def get_ranking(
        ranking_id: str
    ):

        ranking_object_id = (
            RankingService._validate_object_id(
                ranking_id,
                "ranking"
            )
        )

        ranking = (
            RankingService._get_document_or_404(
                ranking_collection,
                ranking_object_id,
                "Ranking"
            )
        )

        return (
            RankingService._convert_object_ids(
                ranking
            )
        )

    # =========================================================
    # GET TOP CANDIDATES
    # =========================================================

    @staticmethod
    def get_top_candidates(
        job_id: str,
        limit: int = 10
    ):

        job_object_id = (
            RankingService._validate_object_id(
                job_id,
                "job"
            )
        )

        try:

            limit = int(
                limit
            )

        except (
            TypeError,
            ValueError
        ):

            limit = 10

        limit = max(
            1,
            min(
                100,
                limit
            )
        )

        rankings = list(

            ranking_collection.find(

                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }

            ).sort(

                "rank",
                1

            ).limit(

                limit

            )

        )

        return [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in rankings

        ]

    # =========================================================
    # GET RANKINGS BY STUDENT
    # =========================================================

    @staticmethod
    def get_rankings_by_student(
        student_id: str
    ):

        queries = [

            {
                "student_id":
                    student_id
            }

        ]

        if ObjectId.is_valid(
            str(student_id)
        ):

            queries.append(

                {
                    "student_id":
                        ObjectId(
                            str(student_id)
                        )
                }

            )

        rankings = list(

            ranking_collection.find(

                {
                    "$or":
                        queries
                }

            ).sort(

                "created_at",
                -1

            )

        )

        return [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in rankings

        ]

    # =========================================================
    # CALCULATE STATISTICS
    # =========================================================

    @staticmethod
    def _calculate_statistics(
        rankings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:

        total = len(
            rankings
        )

        selected = 0
        shortlisted = 0
        under_review = 0
        consider = 0
        rejected = 0

        scores = []

        for ranking in rankings:

            score = (
                RankingService._safe_score(
                    ranking.get(
                        "final_score",
                        0
                    )
                )
            )

            scores.append(
                score
            )

            decision = (
                ranking.get(
                    "selection_status",
                    ""
                )
            )

            if decision == "Selected":

                selected += 1

            elif decision == "Shortlisted":

                shortlisted += 1

            elif decision == "Under Review":

                under_review += 1

            elif decision == "Consider":

                consider += 1

            elif decision == "Rejected":

                rejected += 1

        return {

            "total_candidates":
                total,

            "selected":
                selected,

            "shortlisted":
                shortlisted,

            "under_review":
                under_review,

            "consider":
                consider,

            "rejected":
                rejected,

            "average_score":
                round(
                    sum(scores)
                    /
                    len(scores),
                    2
                )
                if scores
                else 0,

            "highest_score":
                max(scores)
                if scores
                else 0,

            "lowest_score":
                min(scores)
                if scores
                else 0,

        }

    # =========================================================
    # GET RANKING STATISTICS
    # =========================================================

    @staticmethod
    def get_ranking_statistics(
        job_id: str
    ):

        job_object_id = (
            RankingService._validate_object_id(
                job_id,
                "job"
            )
        )

        job = (
            RankingService._get_document_or_404(
                job_collection,
                job_object_id,
                "Job"
            )
        )

        rankings = list(

            ranking_collection.find(

                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }

            )

        )

        converted_rankings = [

            RankingService._convert_object_ids(
                ranking
            )

            for ranking in rankings

        ]

        statistics = (
            RankingService._calculate_statistics(
                converted_rankings
            )
        )

        return {

            "success":
                True,

            "job_id":
                job_id,

            "job_title":
                job.get(
                    "title",
                    ""
                ),

            **statistics,

        }

    # =========================================================
    # UPDATE CANDIDATE DECISION
    # =========================================================

    @staticmethod
    def update_candidate_decision(
        ranking_id: str,
        decision: str,
        reason: str = ""
    ):

        # =====================================================
        # VALIDATE DECISION
        # =====================================================

        if decision not in (
            RankingService.ALLOWED_DECISIONS
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid decision. Allowed decisions: "
                    "Selected, Shortlisted, Under Review, "
                    "Consider, Rejected."
                )

            )

        ranking_object_id = (
            RankingService._validate_object_id(
                ranking_id,
                "ranking"
            )
        )

        ranking = (
            ranking_collection.find_one(
                {
                    "_id":
                        ranking_object_id
                }
            )
        )

        if not ranking:

            raise HTTPException(
                status_code=404,
                detail="Ranking not found."
            )

        current_time = (
            datetime.utcnow()
        )

        # =====================================================
        # DEFAULT RECRUITER REASON
        # =====================================================

        if not reason:

            reason = (
                f"Recruiter manually changed candidate decision "
                f"to {decision}."
            )

        # =====================================================
        # UPDATE RANKING
        # =====================================================

        ranking_collection.update_one(

            {
                "_id":
                    ranking_object_id
            },

            {
                "$set": {

                    "selection_status":
                        decision,

                    "decision_reason":
                        reason,

                    "decision_source":
                        "Recruiter",

                    "decision_at":
                        current_time,

                    "updated_at":
                        current_time,

                }
            }

        )

        # =====================================================
        # GET UPDATED RANKING
        # =====================================================

        updated_ranking = (
            ranking_collection.find_one(
                {
                    "_id":
                        ranking_object_id
                }
            )
        )

        return {

            "success":
                True,

            "message":
                f"Candidate decision updated to {decision}.",

            "ranking":
                RankingService._convert_object_ids(
                    updated_ranking
                ),

        }

    # =========================================================
    # RESET DECISION TO AI
    # =========================================================

    @staticmethod
    def reset_candidate_decision(
        ranking_id: str
    ):

        ranking_object_id = (
            RankingService._validate_object_id(
                ranking_id,
                "ranking"
            )
        )

        ranking = (
            ranking_collection.find_one(
                {
                    "_id":
                        ranking_object_id
                }
            )
        )

        if not ranking:

            raise HTTPException(
                status_code=404,
                detail="Ranking not found."
            )

        final_score = int(
            RankingService._safe_score(
                ranking.get(
                    "final_score",
                    0
                )
            )
        )

        automatic_decision = (
            RankingService._get_selection_status(
                final_score
            )
        )

        current_time = (
            datetime.utcnow()
        )

        ranking_collection.update_one(

            {
                "_id":
                    ranking_object_id
            },

            {
                "$set": {

                    "selection_status":
                        automatic_decision[
                            "status"
                        ],

                    "decision_reason":
                        automatic_decision[
                            "reason"
                        ],

                    "decision_source":
                        "AI",

                    "decision_at":
                        None,

                    "updated_at":
                        current_time,

                }
            }

        )

        updated_ranking = (
            ranking_collection.find_one(
                {
                    "_id":
                        ranking_object_id
                }
            )
        )

        return {

            "success":
                True,

            "message":
                "Candidate decision reset to AI recommendation.",

            "ranking":
                RankingService._convert_object_ids(
                    updated_ranking
                ),

        }

    # =========================================================
    # DELETE SINGLE RANKING
    # =========================================================

    @staticmethod
    def delete_ranking(
        ranking_id: str
    ):

        ranking_object_id = (
            RankingService._validate_object_id(
                ranking_id,
                "ranking"
            )
        )

        result = (
            ranking_collection.delete_one(
                {
                    "_id":
                        ranking_object_id
                }
            )
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Ranking not found."
            )

        return {

            "success":
                True,

            "message":
                "Ranking deleted successfully.",

        }

    # =========================================================
    # DELETE ALL JOB RANKINGS
    # =========================================================

    @staticmethod
    def delete_job_rankings(
        job_id: str
    ):

        job_object_id = (
            RankingService._validate_object_id(
                job_id,
                "job"
            )
        )

        result = (
            ranking_collection.delete_many(

                {
                    "$or": [

                        {
                            "job_id":
                                job_object_id
                        },

                        {
                            "job_id":
                                str(job_id)
                        },

                    ]
                }

            )
        )

        return {

            "success":
                True,

            "message":
                (
                    f"Deleted "
                    f"{result.deleted_count} "
                    f"ranking(s)."
                ),

            "deleted_count":
                result.deleted_count,

        }

    # =========================================================
    # CANDIDATE RANKING SUMMARY
    # =========================================================

    @staticmethod
    def get_candidate_ranking_summary(
        ranking_id: str
    ):

        ranking = (
            RankingService.get_ranking(
                ranking_id
            )
        )

        return {

            **ranking,

            "score_breakdown": {

                "resume_score":
                    ranking.get(
                        "resume_score",
                        0
                    ),

                "jd_match_score":
                    ranking.get(
                        "jd_match_score",
                        0
                    ),

                "interview_score":
                    ranking.get(
                        "interview_score",
                        0
                    ),

                "integrity_score":
                    ranking.get(
                        "integrity_score",
                        0
                    ),

                "final_score":
                    ranking.get(
                        "final_score",
                        0
                    ),

            },

        }
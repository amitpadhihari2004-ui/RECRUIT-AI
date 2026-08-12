from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from bson import ObjectId
from fastapi import HTTPException, status

from app.models.analytics_model import analytics_collection
from app.models.application_model import application_collection
from app.models.resume_model import resume_collection
from app.models.interview_model import interview_collection
from app.models.monitoring_model import monitoring_collection
from app.models.ranking_model import ranking_collection
from app.models.job_model import job_collection


# =========================================================
# STUDENT ANALYTICS SERVICE
# =========================================================
#
# IMPORTANT
#
# This service is STUDENT based.
#
# Every request belongs to ONE student.
#
# Raja logs in
#       ↓
# Raja student_id
#       ↓
# Only Raja's applications
# Only Raja's interviews
# Only Raja's scores
#
# Amit logs in
#       ↓
# Amit student_id
#       ↓
# Only Amit's data
#
# NO organization-wide data is used here.
#
# =========================================================


class AnalyticsService:

    # =====================================================
    # VALIDATE OBJECT ID
    # =====================================================

    @staticmethod
    def _validate_object_id(
        id_string: str,
        field_name: str
    ) -> ObjectId:

        if isinstance(
            id_string,
            ObjectId
        ):
            return id_string

        if id_string is None:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{field_name.capitalize()} ID is required."
                )
            )

        try:

            return ObjectId(
                str(id_string).strip()
            )

        except Exception:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid {field_name} ID format."
                )
            )

    # =====================================================
    # OBJECT ID VALUES
    # =====================================================
    #
    # Some collections use:
    #
    # ObjectId(...)
    #
    # Others use:
    #
    # "..."
    #
    # Support both.
    #
    # =====================================================

    @staticmethod
    def _id_values(
        object_id: ObjectId
    ) -> List[Any]:

        return [
            object_id,
            str(object_id)
        ]

    # =====================================================
    # SERIALIZE MONGO DATA
    # =====================================================

    @staticmethod
    def _convert_object_ids(
        document: Any
    ) -> Any:

        if isinstance(
            document,
            ObjectId
        ):

            return str(
                document
            )

        if isinstance(
            document,
            datetime
        ):

            return document.isoformat()

        if isinstance(
            document,
            list
        ):

            return [
                AnalyticsService._convert_object_ids(
                    item
                )
                for item in document
            ]

        if isinstance(
            document,
            dict
        ):

            return {
                key:
                    AnalyticsService._convert_object_ids(
                        value
                    )
                for key, value in document.items()
            }

        return document

    # =====================================================
    # SAFE NUMBER
    # =====================================================

    @staticmethod
    def _safe_number(
        value: Any,
        default: float = 0.0
    ) -> float:

        if value is None:

            return default

        if isinstance(
            value,
            bool
        ):

            return (
                1.0
                if value
                else 0.0
            )

        try:

            return float(
                value
            )

        except (
            TypeError,
            ValueError
        ):

            return default

    # =====================================================
    # SAFE SCORE
    # =====================================================

    @staticmethod
    def _safe_score(
        value: Any
    ) -> Optional[float]:

        if value is None:

            return None

        try:

            score = float(
                value
            )

        except (
            TypeError,
            ValueError
        ):

            return None

        if score < 0:

            return 0.0

        if score > 100:

            return 100.0

        return score

    # =====================================================
    # SAFE AVERAGE
    # =====================================================

    @staticmethod
    def _average(
        values: List[float]
    ) -> float:

        if not values:

            return 0.0

        valid_values = []

        for value in values:

            score = (
                AnalyticsService
                ._safe_score(
                    value
                )
            )

            if score is not None:

                valid_values.append(
                    score
                )

        if not valid_values:

            return 0.0

        return round(
            sum(valid_values)
            / len(valid_values),
            2
        )

    # =====================================================
    # PERCENTAGE
    # =====================================================

    @staticmethod
    def _percentage(
        part: int,
        total: int
    ) -> float:

        if total <= 0:

            return 0.0

        return round(
            (
                float(part)
                / float(total)
            )
            * 100,
            2
        )

    # =====================================================
    # DATE PARSER
    # =====================================================

    @staticmethod
    def _parse_date(
        value: Any
    ) -> Optional[datetime]:

        if isinstance(
            value,
            datetime
        ):

            return value

        if isinstance(
            value,
            str
        ):

            try:

                return datetime.fromisoformat(
                    value.replace(
                        "Z",
                        ""
                    )
                )

            except Exception:

                return None

        return None

    # =====================================================
    # GET STUDENT
    # =====================================================

    @staticmethod
    def _get_student(
        student_id: ObjectId
    ) -> Optional[Dict[str, Any]]:

        # -------------------------------------------------
        # USER COLLECTION
        # -------------------------------------------------

        try:

            from app.models.user_model import (
                user_collection
            )

            student = (
                user_collection.find_one(
                    {
                        "_id":
                            student_id
                    }
                )
            )

            if student:

                return student

        except Exception as error:

            print(
                "User collection lookup error:",
                repr(error)
            )

        # -------------------------------------------------
        # STUDENT COLLECTION FALLBACK
        # -------------------------------------------------

        try:

            from app.models.student_model import (
                student_collection
            )

            student = (
                student_collection.find_one(
                    {
                        "_id":
                            student_id
                    }
                )
            )

            if student:

                return student

        except Exception:

            pass

        return None

    # =====================================================
    # GET STUDENT APPLICATIONS
    # =====================================================

    @staticmethod
    def _get_student_applications(
        student_id: ObjectId
    ) -> List[Dict[str, Any]]:

        ids = (
            AnalyticsService
            ._id_values(
                student_id
            )
        )

        try:

            applications = list(
                application_collection.find(
                    {
                        "student_id":
                            {
                                "$in":
                                    ids
                            }
                    }
                ).sort(
                    "created_at",
                    -1
                )
            )

            return applications

        except Exception as error:

            print(
                "Student applications lookup error:",
                repr(error)
            )

            return []

    # =====================================================
    # GET STUDENT INTERVIEWS
    # =====================================================

    @staticmethod
    def _get_student_interviews(
        student_id: ObjectId
    ) -> List[Dict[str, Any]]:

        ids = (
            AnalyticsService
            ._id_values(
                student_id
            )
        )

        try:

            interviews = list(
                interview_collection.find(
                    {
                        "student_id":
                            {
                                "$in":
                                    ids
                            }
                    }
                ).sort(
                    "created_at",
                    -1
                )
            )

            # -------------------------------------------------
            # FALLBACK candidate_id
            # -------------------------------------------------

            if not interviews:

                interviews = list(
                    interview_collection.find(
                        {
                            "candidate_id":
                                {
                                    "$in":
                                        ids
                                }
                        }
                    ).sort(
                        "created_at",
                        -1
                    )
                )

            return interviews

        except Exception as error:

            print(
                "Student interviews lookup error:",
                repr(error)
            )

            return []

    # =====================================================
    # APPLICATION STATUS
    # =====================================================

    @staticmethod
    def _get_application_status(
        application: Dict[str, Any]
    ) -> str:

        # -------------------------------------------------
        # IMPORTANT
        #
        # Actual application document uses:
        #
        # application_status
        #
        # NOT:
        #
        # status
        # -------------------------------------------------

        value = (
            application.get(
                "application_status"
            )
            or application.get(
                "status"
            )
            or "Pending"
        )

        return str(
            value
        ).strip().lower()

    # =====================================================
    # NORMALIZE APPLICATION STATUS
    # =====================================================

    @staticmethod
    def _normalize_application_status(
        value: Any
    ) -> str:

        if value is None:

            return "pending"

        value = str(
            value
        ).strip().lower()

        # -------------------------------------------------
        # APPLIED
        # -------------------------------------------------

        if value in [
            "applied",
            "application",
            "submitted",
            "pending"
        ]:

            if value == "pending":

                return "pending"

            return "applied"

        # -------------------------------------------------
        # SHORTLISTED
        # -------------------------------------------------

        if value in [
            "shortlisted",
            "shortlist",
            "short-listed"
        ]:

            return "shortlisted"

        # -------------------------------------------------
        # INTERVIEW
        # -------------------------------------------------

        if value in [
            "interview",
            "interviewed",
            "interview_scheduled",
            "interview scheduled"
        ]:

            return "interview"

        # -------------------------------------------------
        # SELECTED
        # -------------------------------------------------

        if value in [
            "selected",
            "hired",
            "accepted",
            "offer"
        ]:

            return "selected"

        # -------------------------------------------------
        # REJECTED
        # -------------------------------------------------

        if value in [
            "rejected",
            "declined",
            "reject"
        ]:

            return "rejected"

        # -------------------------------------------------
        # REVIEW
        # -------------------------------------------------

        if value in [
            "under_review",
            "under review",
            "review"
        ]:

            return "pending"

        return "pending"

    # =====================================================
    # GET APPLICATION RESUME SCORE
    # =====================================================
    #
    # IMPORTANT:
    #
    # Your application stores:
    #
    # "resume_score": ...
    #
    # directly in application_collection.
    #
    # Therefore we MUST read it from application first.
    #
    # =====================================================

    @staticmethod
    def _get_application_resume_score(
        application: Dict[str, Any]
    ) -> Optional[float]:

        # -------------------------------------------------
        # PRIMARY
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                application.get(
                    "resume_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # FALLBACK: resume document
        # -------------------------------------------------

        resume_id = application.get(
            "resume_id"
        )

        if not resume_id:

            return None

        resume_object_id = None

        if isinstance(
            resume_id,
            ObjectId
        ):

            resume_object_id = resume_id

        else:

            try:

                resume_object_id = ObjectId(
                    str(resume_id)
                )

            except Exception:

                resume_object_id = None

        if not resume_object_id:

            return None

        try:

            resume = (
                resume_collection.find_one(
                    {
                        "_id":
                            resume_object_id
                    }
                )
            )

        except Exception:

            return None

        if not resume:

            return None

        # -------------------------------------------------
        # ROOT RESUME SCORE
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                resume.get(
                    "resume_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # ANALYSIS FALLBACK
        # -------------------------------------------------

        analysis = resume.get(
            "analysis"
        )

        if isinstance(
            analysis,
            dict
        ):

            return (
                AnalyticsService
                ._safe_score(
                    analysis.get(
                        "resume_score"
                    )
                )
            )

        return None

    # =====================================================
    # GET APPLICATION JD MATCH SCORE
    # =====================================================

    @staticmethod
    def _get_application_jd_score(
        application: Dict[str, Any]
    ) -> Optional[float]:

        # -------------------------------------------------
        # PRIMARY
        #
        # Application stores:
        #
        # jd_match_score
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                application.get(
                    "jd_match_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # FALLBACK JD MATCH OBJECT
        # -------------------------------------------------

        jd_match = application.get(
            "jd_match"
        )

        if isinstance(
            jd_match,
            dict
        ):

            score = (
                AnalyticsService
                ._safe_score(
                    jd_match.get(
                        "match_percentage"
                    )
                )
            )

            if score is not None:

                return score

        # -------------------------------------------------
        # RESUME FALLBACK
        # -------------------------------------------------

        resume_id = application.get(
            "resume_id"
        )

        if not resume_id:

            return None

        try:

            resume_object_id = (
                resume_id
                if isinstance(
                    resume_id,
                    ObjectId
                )
                else ObjectId(
                    str(resume_id)
                )
            )

        except Exception:

            return None

        try:

            resume = (
                resume_collection.find_one(
                    {
                        "_id":
                            resume_object_id
                    }
                )
            )

        except Exception:

            return None

        if not resume:

            return None

        score = (
            AnalyticsService
            ._safe_score(
                resume.get(
                    "jd_match_score"
                )
            )
        )

        if score is not None:

            return score

        analysis = resume.get(
            "analysis"
        )

        if isinstance(
            analysis,
            dict
        ):

            return (
                AnalyticsService
                ._safe_score(
                    analysis.get(
                        "jd_match_score"
                    )
                )
            )

        return None

    # =====================================================
    # GET APPLICATION SKILLS
    # =====================================================

    @staticmethod
    def _get_application_skills(
        application: Dict[str, Any]
    ) -> List[str]:

        skills = []

        # -------------------------------------------------
        # MATCHED SKILLS
        # -------------------------------------------------

        matched = application.get(
            "matched_skills",
            []
        )

        if isinstance(
            matched,
            list
        ):

            skills.extend(
                matched
            )

        # -------------------------------------------------
        # SKILLS FIELD
        # -------------------------------------------------

        direct_skills = application.get(
            "skills",
            []
        )

        if isinstance(
            direct_skills,
            list
        ):

            skills.extend(
                direct_skills
            )

        # -------------------------------------------------
        # RESUME FALLBACK
        # -------------------------------------------------

        if not skills:

            resume_id = application.get(
                "resume_id"
            )

            if resume_id:

                try:

                    resume_object_id = (
                        resume_id
                        if isinstance(
                            resume_id,
                            ObjectId
                        )
                        else ObjectId(
                            str(resume_id)
                        )
                    )

                    resume = (
                        resume_collection.find_one(
                            {
                                "_id":
                                    resume_object_id
                            }
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

                            resume_skills = (
                                analysis.get(
                                    "skills",
                                    []
                                )
                            )

                            if isinstance(
                                resume_skills,
                                list
                            ):

                                skills.extend(
                                    resume_skills
                                )

                except Exception:

                    pass

        # -------------------------------------------------
        # NORMALIZE
        # -------------------------------------------------

        result = []

        for skill in skills:

            if isinstance(
                skill,
                str
            ):

                name = skill.strip()

            elif isinstance(
                skill,
                dict
            ):

                name = (
                    skill.get(
                        "name"
                    )
                    or skill.get(
                        "skill"
                    )
                    or skill.get(
                        "title"
                    )
                    or ""
                )

                name = str(
                    name
                ).strip()

            else:

                continue

            if name:

                result.append(
                    name
                )

        return result

    # =====================================================
    # INTERVIEW OVERALL SCORE
    # =====================================================

    @staticmethod
    def _get_interview_overall_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        # -------------------------------------------------
        # ROOT LEVEL
        #
        # Your InterviewService stores:
        #
        # "overall_score"
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "overall_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # evaluation
        # -------------------------------------------------

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            score = (
                AnalyticsService
                ._safe_score(
                    evaluation.get(
                        "overall_score"
                    )
                )
            )

            if score is not None:

                return score

        # -------------------------------------------------
        # ai_evaluation
        # -------------------------------------------------

        ai_evaluation = interview.get(
            "ai_evaluation"
        )

        if isinstance(
            ai_evaluation,
            dict
        ):

            score = (
                AnalyticsService
                ._safe_score(
                    ai_evaluation.get(
                        "overall_score"
                    )
                )
            )

            if score is not None:

                return score

        return None

    # =====================================================
    # TECHNICAL SCORE
    # =====================================================

    @staticmethod
    def _get_technical_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "technical_score"
                )
            )
        )

        if score is not None:

            return score

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            return (
                AnalyticsService
                ._safe_score(
                    evaluation.get(
                        "technical_score"
                    )
                )
            )

        return None

    # =====================================================
    # COMMUNICATION SCORE
    # =====================================================

    @staticmethod
    def _get_communication_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "communication_score"
                )
            )
        )

        if score is not None:

            return score

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            return (
                AnalyticsService
                ._safe_score(
                    evaluation.get(
                        "communication_score"
                    )
                )
            )

        return None

    # =====================================================
    # CONFIDENCE SCORE
    # =====================================================

    @staticmethod
    def _get_confidence_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "confidence_score"
                )
            )
        )

        if score is not None:

            return score

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            return (
                AnalyticsService
                ._safe_score(
                    evaluation.get(
                        "confidence_score"
                    )
                )
            )

        return None

    # =====================================================
    # FINAL SCORE
    # =====================================================

    @staticmethod
    def _get_final_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        # -------------------------------------------------
        # ROOT
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "final_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # evaluation
        # -------------------------------------------------

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            score = (
                AnalyticsService
                ._safe_score(
                    evaluation.get(
                        "final_score"
                    )
                )
            )

            if score is not None:

                return score

        # -------------------------------------------------
        # ranking fallback is handled separately
        # -------------------------------------------------

        return None

    # =====================================================
    # INTEGRITY SCORE
    # =====================================================

    @staticmethod
    def _get_integrity_score(
        interview: Dict[str, Any]
    ) -> Optional[float]:

        # -------------------------------------------------
        # ROOT
        # -------------------------------------------------

        score = (
            AnalyticsService
            ._safe_score(
                interview.get(
                    "integrity_score"
                )
            )
        )

        if score is not None:

            return score

        # -------------------------------------------------
        # PROCTORING
        # -------------------------------------------------

        proctoring = interview.get(
            "proctoring"
        )

        if isinstance(
            proctoring,
            dict
        ):

            score = (
                AnalyticsService
                ._safe_score(
                    proctoring.get(
                        "integrity_score"
                    )
                )
            )

            if score is not None:

                return score

        # -------------------------------------------------
        # MONITORING FALLBACK
        # -------------------------------------------------

        interview_id = interview.get(
            "_id"
        )

        if interview_id:

            ids = (
                AnalyticsService
                ._id_values(
                    interview_id
                )
            )

            try:

                monitoring = (
                    monitoring_collection.find_one(
                        {
                            "interview_id":
                                {
                                    "$in":
                                        ids
                                }
                        }
                    )
                )

                if monitoring:

                    score = (
                        AnalyticsService
                        ._safe_score(
                            monitoring.get(
                                "integrity_score"
                            )
                        )
                    )

                    if score is not None:

                        return score

            except Exception:

                pass

        return None

    # =====================================================
    # PROCTORING DETAILS
    # =====================================================

    @staticmethod
    def _get_proctoring_details(
        interview: Dict[str, Any]
    ) -> Dict[str, Any]:

        proctoring = interview.get(
            "proctoring"
        )

        if isinstance(
            proctoring,
            dict
        ):

            return proctoring

        interview_id = interview.get(
            "_id"
        )

        if not interview_id:

            return {}

        try:

            monitoring = (
                monitoring_collection.find_one(
                    {
                        "interview_id":
                            {
                                "$in":
                                    AnalyticsService
                                    ._id_values(
                                        interview_id
                                    )
                            }
                    }
                )
            )

            if monitoring:

                return monitoring

        except Exception:

            pass

        return {}

    # =====================================================
    # RECOMMENDATION
    # =====================================================

    @staticmethod
    def _get_recommendation(
        interview: Dict[str, Any]
    ) -> str:

        value = (
            interview.get(
                "recommendation"
            )
            or interview.get(
                "overall_recommendation"
            )
        )

        if value:

            return str(
                value
            ).strip()

        evaluation = interview.get(
            "evaluation"
        )

        if isinstance(
            evaluation,
            dict
        ):

            value = (
                evaluation.get(
                    "recommendation"
                )
                or evaluation.get(
                    "overall_recommendation"
                )
            )

            if value:

                return str(
                    value
                ).strip()

        return ""

    # =====================================================
    # SCORE DISTRIBUTION
    # =====================================================

    @staticmethod
    def _score_distribution(
        scores: List[float]
    ) -> Dict[str, int]:

        result = {

            "0-20":
                0,

            "21-40":
                0,

            "41-60":
                0,

            "61-80":
                0,

            "81-100":
                0
        }

        for value in scores:

            score = (
                AnalyticsService
                ._safe_score(
                    value
                )
            )

            if score is None:

                continue

            if score <= 20:

                result[
                    "0-20"
                ] += 1

            elif score <= 40:

                result[
                    "21-40"
                ] += 1

            elif score <= 60:

                result[
                    "41-60"
                ] += 1

            elif score <= 80:

                result[
                    "61-80"
                ] += 1

            else:

                result[
                    "81-100"
                ] += 1

        return result

    # =====================================================
    # MONTH KEY
    # =====================================================

    @staticmethod
    def _month_key(
        value: Any
    ) -> Optional[str]:

        date_value = (
            AnalyticsService
            ._parse_date(
                value
            )
        )

        if not date_value:

            return None

        return date_value.strftime(
            "%Y-%m"
        )

    # =====================================================
    # GET JOB
    # =====================================================

    @staticmethod
    def _get_job(
        job_id: Any
    ) -> Optional[Dict[str, Any]]:

        if not job_id:

            return None

        try:

            object_id = (
                job_id
                if isinstance(
                    job_id,
                    ObjectId
                )
                else ObjectId(
                    str(job_id)
                )
            )

        except Exception:

            return None

        try:

            return (
                job_collection.find_one(
                    {
                        "_id":
                            object_id
                    }
                )
            )

        except Exception:

            return None

    # =====================================================
    # MAIN STUDENT ANALYTICS
    # =====================================================

    @staticmethod
    def get_student_analytics(
        student_id: str
    ) -> Dict[str, Any]:

        # =================================================
        # VALIDATE STUDENT
        # =================================================

        student_object_id = (
            AnalyticsService
            ._validate_object_id(
                student_id,
                "student"
            )
        )

        # =================================================
        # GET STUDENT
        # =================================================

        student = (
            AnalyticsService
            ._get_student(
                student_object_id
            )
        )

        if not student:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found."
            )

        # =================================================
        # GET ONLY THIS STUDENT'S DATA
        # =================================================

        applications = (
            AnalyticsService
            ._get_student_applications(
                student_object_id
            )
        )

        interviews = (
            AnalyticsService
            ._get_student_interviews(
                student_object_id
            )
        )

        # =================================================
        # DEBUG
        # =================================================

        print(
            "========================================"
        )

        print(
            "STUDENT ANALYTICS"
        )

        print(
            "Student ID:",
            str(student_object_id)
        )

        print(
            "Applications found:",
            len(applications)
        )

        print(
            "Interviews found:",
            len(interviews)
        )

        print(
            "========================================"
        )

        # =================================================
        # SCORE ARRAYS
        # =================================================

        resume_scores = []

        jd_match_scores = []

        interview_scores = []

        technical_scores = []

        communication_scores = []

        confidence_scores = []

        integrity_scores = []

        final_scores = []

        # =================================================
        # SKILL COUNTER
        # =================================================

        skill_counter = {}

        # =================================================
        # APPLICATION STATUS
        # =================================================

        application_status = {

            "applied":
                0,

            "pending":
                0,

            "shortlisted":
                0,

            "interview":
                0,

            "selected":
                0,

            "rejected":
                0
        }

        # =================================================
        # APPLICATION PERFORMANCE
        # =================================================

        application_performance = []

        # =================================================
        # PROCESS APPLICATIONS
        # =================================================

        for application in applications:

            normalized_status = (
                AnalyticsService
                ._normalize_application_status(
                    AnalyticsService
                    ._get_application_status(
                        application
                    )
                )
            )

            application_status[
                normalized_status
            ] += 1

            # -------------------------------------------------
            # ROOT APPLICATION SCORES
            #
            # THIS IS THE IMPORTANT FIX.
            # -------------------------------------------------

            resume_score = (
                AnalyticsService
                ._get_application_resume_score(
                    application
                )
            )

            jd_score = (
                AnalyticsService
                ._get_application_jd_score(
                    application
                )
            )

            if resume_score is not None:

                resume_scores.append(
                    resume_score
                )

            if jd_score is not None:

                jd_match_scores.append(
                    jd_score
                )

            # -------------------------------------------------
            # SKILLS
            # -------------------------------------------------

            skills = (
                AnalyticsService
                ._get_application_skills(
                    application
                )
            )

            for skill in skills:

                skill_key = (
                    skill.lower().strip()
                )

                if not skill_key:

                    continue

                if skill_key not in skill_counter:

                    skill_counter[
                        skill_key
                    ] = {

                        "skill":
                            skill,

                        "count":
                            0
                    }

                skill_counter[
                    skill_key
                ][
                    "count"
                ] += 1

            # -------------------------------------------------
            # JOB
            # -------------------------------------------------

            job = (
                AnalyticsService
                ._get_job(
                    application.get(
                        "job_id"
                    )
                )
            )

            # -------------------------------------------------
            # APPLICATION DATA
            # -------------------------------------------------

            application_performance.append(

                {

                    "application_id":
                        str(
                            application.get(
                                "_id"
                            )
                        ),

                    "job_id":
                        (
                            str(
                                application.get(
                                    "job_id"
                                )
                            )
                            if application.get(
                                "job_id"
                            )
                            else None
                        ),

                    "job_title":
                        (
                            application.get(
                                "job_title"
                            )
                            or (
                                job.get(
                                    "title",
                                    ""
                                )
                                if job
                                else ""
                            )
                        ),

                    "company_name":
                        (
                            application.get(
                                "company_name"
                            )
                            or (
                                job.get(
                                    "company_name",
                                    ""
                                )
                                if job
                                else ""
                            )
                        ),

                    "application_status":
                        application.get(
                            "application_status"
                        )
                        or application.get(
                            "status"
                        )
                        or "Pending",

                    "resume_score":
                        (
                            resume_score
                            if resume_score is not None
                            else 0.0
                        ),

                    "jd_match_score":
                        (
                            jd_score
                            if jd_score is not None
                            else 0.0
                        ),

                    "interview_score":
                        0.0,

                    "integrity_score":
                        0.0,

                    "final_score":
                        0.0,

                    "created_at":
                        AnalyticsService
                        ._convert_object_ids(
                            application.get(
                                "created_at"
                            )
                        ),

                    "updated_at":
                        AnalyticsService
                        ._convert_object_ids(
                            application.get(
                                "updated_at"
                            )
                        )
                }
            )

        # =================================================
        # INTERVIEW COUNTS
        # =================================================

        completed_interviews = 0

        pending_interviews = 0

        scheduled_interviews = 0

        cancelled_interviews = 0

        # =================================================
        # PROCTORING
        # =================================================

        total_warnings = 0

        suspicious_events = 0

        tab_switches = 0

        fullscreen_exits = 0

        multiple_person_detected = 0

        face_not_detected = 0

        camera_warnings = 0

        microphone_warnings = 0

        copy_paste_events = 0

        # =================================================
        # INTERVIEW PERFORMANCE
        # =================================================

        interview_performance = []

        # =================================================
        # PROCESS INTERVIEWS
        # =================================================

        for interview in interviews:

            interview_status = str(
                interview.get(
                    "status",
                    "Pending"
                )
            ).strip().lower()

            # -------------------------------------------------
            # STATUS
            # -------------------------------------------------

            if interview_status in [
                "completed",
                "evaluated",
                "finished"
            ]:

                completed_interviews += 1

            elif interview_status in [
                "cancelled",
                "canceled"
            ]:

                cancelled_interviews += 1

            elif interview_status in [
                "scheduled"
            ]:

                scheduled_interviews += 1

                pending_interviews += 1

            elif interview_status in [
                "confirmed",
                "rescheduled",
                "in progress",
                "in_progress"
            ]:

                pending_interviews += 1

            else:

                pending_interviews += 1

            # -------------------------------------------------
            # SCORES
            # -------------------------------------------------

            overall_score = (
                AnalyticsService
                ._get_interview_overall_score(
                    interview
                )
            )

            technical_score = (
                AnalyticsService
                ._get_technical_score(
                    interview
                )
            )

            communication_score = (
                AnalyticsService
                ._get_communication_score(
                    interview
                )
            )

            confidence_score = (
                AnalyticsService
                ._get_confidence_score(
                    interview
                )
            )

            integrity_score = (
                AnalyticsService
                ._get_integrity_score(
                    interview
                )
            )

            final_score = (
                AnalyticsService
                ._get_final_score(
                    interview
                )
            )

            # -------------------------------------------------
            # ONLY ADD ACTUAL SCORES
            #
            # A scheduled interview has 0 initially.
            # We do NOT add that 0 as an evaluated score.
            # -------------------------------------------------

            if (
                overall_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                interview_scores.append(
                    overall_score
                )

            if (
                technical_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                technical_scores.append(
                    technical_score
                )

            if (
                communication_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                communication_scores.append(
                    communication_score
                )

            if (
                confidence_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                confidence_scores.append(
                    confidence_score
                )

            if (
                integrity_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                integrity_scores.append(
                    integrity_score
                )

            if (
                final_score is not None
                and
                interview_status in [
                    "completed",
                    "evaluated",
                    "finished"
                ]
            ):

                final_scores.append(
                    final_score
                )

            # -------------------------------------------------
            # PROCTORING
            # -------------------------------------------------

            proctoring = (
                AnalyticsService
                ._get_proctoring_details(
                    interview
                )
            )

            total_warnings += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "warnings",
                        0
                    )
                )
            )

            suspicious_events += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "suspicious_events",
                        0
                    )
                )
            )

            tab_switches += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "tab_switches",
                        0
                    )
                )
            )

            fullscreen_exits += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "fullscreen_exits",
                        0
                    )
                )
            )

            multiple_person_detected += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "multiple_person_detected",
                        0
                    )
                )
            )

            face_not_detected += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "face_not_detected",
                        0
                    )
                )
            )

            camera_warnings += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "camera_warnings",
                        0
                    )
                )
            )

            microphone_warnings += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "microphone_warnings",
                        0
                    )
                )
            )

            copy_paste_events += int(
                AnalyticsService
                ._safe_number(
                    proctoring.get(
                        "copy_paste_events",
                        0
                    )
                )
            )

            # -------------------------------------------------
            # JOB
            # -------------------------------------------------

            job = (
                AnalyticsService
                ._get_job(
                    interview.get(
                        "job_id"
                    )
                )
            )

            # -------------------------------------------------
            # INTERVIEW PERFORMANCE
            # -------------------------------------------------

            interview_performance.append(

                {

                    "interview_id":
                        str(
                            interview.get(
                                "_id"
                            )
                        ),

                    "application_id":
                        (
                            str(
                                interview.get(
                                    "application_id"
                                )
                            )
                            if interview.get(
                                "application_id"
                            )
                            else None
                        ),

                    "job_id":
                        (
                            str(
                                interview.get(
                                    "job_id"
                                )
                            )
                            if interview.get(
                                "job_id"
                            )
                            else None
                        ),

                    "job_title":
                        (
                            job.get(
                                "title",
                                ""
                            )
                            if job
                            else ""
                        ),

                    "interview_type":
                        (
                            interview.get(
                                "interview_type"
                            )
                            or interview.get(
                                "type"
                            )
                            or ""
                        ),

                    "status":
                        interview.get(
                            "status",
                            "Pending"
                        ),

                    "score":
                        (
                            overall_score
                            if overall_score is not None
                            else 0.0
                        ),

                    "technical_score":
                        (
                            technical_score
                            if technical_score is not None
                            else 0.0
                        ),

                    "communication_score":
                        (
                            communication_score
                            if communication_score is not None
                            else 0.0
                        ),

                    "confidence_score":
                        (
                            confidence_score
                            if confidence_score is not None
                            else 0.0
                        ),

                    "integrity_score":
                        (
                            integrity_score
                            if integrity_score is not None
                            else 0.0
                        ),

                    "final_score":
                        (
                            final_score
                            if final_score is not None
                            else 0.0
                        ),

                    "recommendation":
                        AnalyticsService
                        ._get_recommendation(
                            interview
                        ),

                    "completed_at":
                        AnalyticsService
                        ._convert_object_ids(
                            interview.get(
                                "completed_at"
                            )
                        ),

                    "created_at":
                        AnalyticsService
                        ._convert_object_ids(
                            interview.get(
                                "created_at"
                            )
                        )
                }
            )

        # =================================================
        # FINAL SCORE FROM RANKING
        # =================================================
        #
        # If interview does not have final_score,
        # try ranking collection.
        #
        # =================================================

        if not final_scores:

            application_ids = [

                application.get(
                    "_id"
                )

                for application
                in applications

                if application.get(
                    "_id"
                )
            ]

            for application_id in application_ids:

                ranking_documents = []

                try:

                    ranking_documents = list(
                        ranking_collection.find(
                            {
                                "application_id":
                                    {
                                        "$in":
                                            AnalyticsService
                                            ._id_values(
                                                application_id
                                            )
                                    }
                            }
                        )
                    )

                except Exception:

                    pass

                for ranking in ranking_documents:

                    ranking_score = (
                        AnalyticsService
                        ._safe_score(
                            ranking.get(
                                "final_score"
                            )
                        )
                    )

                    if ranking_score is not None:

                        final_scores.append(
                            ranking_score
                        )

        # =================================================
        # CONNECT INTERVIEWS TO APPLICATIONS
        # =================================================

        for item in application_performance:

            application_id = str(
                item.get(
                    "application_id"
                )
            )

            for interview in interviews:

                interview_application_id = (
                    interview.get(
                        "application_id"
                    )
                )

                if not interview_application_id:

                    continue

                if (
                    str(
                        interview_application_id
                    )
                    != application_id
                ):

                    continue

                overall = (
                    AnalyticsService
                    ._get_interview_overall_score(
                        interview
                    )
                )

                integrity = (
                    AnalyticsService
                    ._get_integrity_score(
                        interview
                    )
                )

                final_value = (
                    AnalyticsService
                    ._get_final_score(
                        interview
                    )
                )

                item[
                    "interview_score"
                ] = (
                    overall
                    if overall is not None
                    else 0.0
                )

                item[
                    "integrity_score"
                ] = (
                    integrity
                    if integrity is not None
                    else 0.0
                )

                item[
                    "final_score"
                ] = (
                    final_value
                    if final_value is not None
                    else 0.0
                )

                break

        # =================================================
        # TOP SKILLS
        # =================================================

        top_skills = sorted(
            skill_counter.values(),
            key=lambda item:
                item.get(
                    "count",
                    0
                ),
            reverse=True
        )[:10]

        matched_skills = [
            item.get(
                "skill",
                ""
            )
            for item
            in top_skills
        ]

        # =================================================
        # MONTHLY PERFORMANCE
        # =================================================

        monthly_map = {}

        today = datetime.utcnow()

        for index in range(
            11,
            -1,
            -1
        ):

            date_value = (
                today
                - timedelta(
                    days=30 * index
                )
            )

            key = date_value.strftime(
                "%Y-%m"
            )

            monthly_map[
                key
            ] = {

                "applications":
                    0,

                "interviews":
                    0,

                "selections":
                    0,

                "scores":
                    []
            }

        # =================================================
        # MONTHLY APPLICATIONS
        # =================================================

        for application in applications:

            created_key = (
                AnalyticsService
                ._month_key(
                    application.get(
                        "created_at"
                    )
                )
            )

            if created_key in monthly_map:

                monthly_map[
                    created_key
                ][
                    "applications"
                ] += 1

            status_value = (
                AnalyticsService
                ._normalize_application_status(
                    AnalyticsService
                    ._get_application_status(
                        application
                    )
                )
            )

            if status_value == "selected":

                selection_key = (
                    AnalyticsService
                    ._month_key(
                        application.get(
                            "updated_at"
                        )
                    )
                )

                if selection_key in monthly_map:

                    monthly_map[
                        selection_key
                    ][
                        "selections"
                    ] += 1

        # =================================================
        # MONTHLY INTERVIEWS
        # =================================================

        for interview in interviews:

            created_key = (
                AnalyticsService
                ._month_key(
                    interview.get(
                        "created_at"
                    )
                )
            )

            if created_key in monthly_map:

                monthly_map[
                    created_key
                ][
                    "interviews"
                ] += 1

                interview_score = (
                    AnalyticsService
                    ._get_interview_overall_score(
                        interview
                    )
                )

                if interview_score is not None:

                    monthly_map[
                        created_key
                    ][
                        "scores"
                    ].append(
                        interview_score
                    )

        monthly_performance = []

        for month, month_data in sorted(
            monthly_map.items()
        ):

            monthly_performance.append(

                {

                    "month":
                        month,

                    "applications":
                        month_data[
                            "applications"
                        ],

                    "interviews":
                        month_data[
                            "interviews"
                        ],

                    "selections":
                        month_data[
                            "selections"
                        ],

                    "average_score":
                        AnalyticsService
                        ._average(
                            month_data[
                                "scores"
                            ]
                        )
                }
            )

        # =================================================
        # COUNTS
        # =================================================

        total_applications = len(
            applications
        )

        total_interviews = len(
            interviews
        )

        selected_count = (
            application_status[
                "selected"
            ]
        )

        shortlisted_count = (
            application_status[
                "shortlisted"
            ]
        )

        rejected_count = (
            application_status[
                "rejected"
            ]
        )

        # =================================================
        # AVERAGES
        # =================================================

        average_resume_score = (
            AnalyticsService
            ._average(
                resume_scores
            )
        )

        average_jd_match_score = (
            AnalyticsService
            ._average(
                jd_match_scores
            )
        )

        average_interview_score = (
            AnalyticsService
            ._average(
                interview_scores
            )
        )

        average_technical_score = (
            AnalyticsService
            ._average(
                technical_scores
            )
        )

        average_communication_score = (
            AnalyticsService
            ._average(
                communication_scores
            )
        )

        average_confidence_score = (
            AnalyticsService
            ._average(
                confidence_scores
            )
        )

        average_integrity_score = (
            AnalyticsService
            ._average(
                integrity_scores
            )
        )

        average_final_score = (
            AnalyticsService
            ._average(
                final_scores
            )
        )

        hiring_success_rate = (
            AnalyticsService
            ._percentage(
                selected_count,
                total_applications
            )
        )

        # =================================================
        # OVERALL STATUS
        # =================================================

        overall_integrity_status = (

            "Attention Required"

            if (
                total_warnings > 0
                or
                suspicious_events > 0
            )

            else "Normal"
        )

        # =================================================
        # STUDENT NAME
        # =================================================

        student_name = (

            student.get(
                "full_name"
            )

            or student.get(
                "name"
            )

            or ""

        )

        student_email = (
            student.get(
                "email",
                ""
            )
        )

        # =================================================
        # FINAL RESPONSE
        # =================================================

        now = datetime.utcnow().isoformat()

        return {

            # =================================================
            # IDENTIFICATION
            # =================================================

            "student_id":
                str(
                    student_object_id
                ),

            "student_name":
                student_name,

            "student_email":
                student_email,

            # =================================================
            # FLAT VALUES
            #
            # Kept intentionally because your existing
            # ReportsAnalytics.jsx uses these fields.
            # =================================================

            "total_applications":
                total_applications,

            "shortlisted_candidates":
                shortlisted_count,

            "selected_candidates":
                selected_count,

            "rejected_candidates":
                rejected_count,

            "total_interviews":
                total_interviews,

            "completed_interviews":
                completed_interviews,

            "pending_interviews":
                pending_interviews,

            "average_resume_score":
                average_resume_score,

            "average_jd_match_score":
                average_jd_match_score,

            "average_interview_score":
                average_interview_score,

            "average_integrity_score":
                average_integrity_score,

            "average_final_score":
                average_final_score,

            "hiring_success_rate":
                hiring_success_rate,

            "top_skills":
                matched_skills,

            # =================================================
            # APPLICATIONS
            # =================================================

            "applications": {

                "total_applications":
                    total_applications,

                "active_applications":
                    (
                        application_status[
                            "applied"
                        ]
                        +
                        application_status[
                            "pending"
                        ]
                        +
                        application_status[
                            "shortlisted"
                        ]
                        +
                        application_status[
                            "interview"
                        ]
                    ),

                "pending_applications":
                    application_status[
                        "pending"
                    ],

                "shortlisted_applications":
                    application_status[
                        "shortlisted"
                    ],

                "interview_applications":
                    application_status[
                        "interview"
                    ],

                "selected_applications":
                    application_status[
                        "selected"
                    ],

                "rejected_applications":
                    application_status[
                        "rejected"
                    ]
            },

            # =================================================
            # INTERVIEWS
            # =================================================

            "interviews": {

                "total_interviews":
                    total_interviews,

                "completed_interviews":
                    completed_interviews,

                "pending_interviews":
                    pending_interviews,

                "scheduled_interviews":
                    scheduled_interviews,

                "cancelled_interviews":
                    cancelled_interviews
            },

            # =================================================
            # RESUME
            # =================================================

            "resume": {

                "total_resumes":
                    len(
                        resume_scores
                    ),

                "average_resume_score":
                    average_resume_score,

                "highest_resume_score":
                    (
                        max(
                            resume_scores
                        )
                        if resume_scores
                        else 0.0
                    ),

                "lowest_resume_score":
                    (
                        min(
                            resume_scores
                        )
                        if resume_scores
                        else 0.0
                    )
            },

            # =================================================
            # JD MATCH
            # =================================================

            "jd_match": {

                "total_job_matches":
                    len(
                        jd_match_scores
                    ),

                "average_jd_match_score":
                    average_jd_match_score,

                "highest_jd_match_score":
                    (
                        max(
                            jd_match_scores
                        )
                        if jd_match_scores
                        else 0.0
                    ),

                "lowest_jd_match_score":
                    (
                        min(
                            jd_match_scores
                        )
                        if jd_match_scores
                        else 0.0
                    )
            },

            # =================================================
            # AI SCORES
            # =================================================

            "ai_scores": {

                "average_interview_score":
                    average_interview_score,

                "highest_interview_score":
                    (
                        max(
                            interview_scores
                        )
                        if interview_scores
                        else 0.0
                    ),

                "lowest_interview_score":
                    (
                        min(
                            interview_scores
                        )
                        if interview_scores
                        else 0.0
                    ),

                "average_technical_score":
                    average_technical_score,

                "average_communication_score":
                    average_communication_score,

                "average_confidence_score":
                    average_confidence_score
            },

            # =================================================
            # INTEGRITY
            # =================================================

            "integrity": {

                "average_integrity_score":
                    average_integrity_score,

                "total_warnings":
                    total_warnings,

                "warnings":
                    total_warnings,

                "suspicious_events":
                    suspicious_events,

                "tab_switches":
                    tab_switches,

                "fullscreen_exits":
                    fullscreen_exits,

                "multiple_person_detected":
                    multiple_person_detected,

                "face_not_detected":
                    face_not_detected,

                "camera_warnings":
                    camera_warnings,

                "microphone_warnings":
                    microphone_warnings,

                "copy_paste_events":
                    copy_paste_events,

                "overall_status":
                    overall_integrity_status
            },

            # =================================================
            # FINAL SCORE
            # =================================================

            "final_score": {

                "average_final_score":
                    average_final_score,

                "highest_final_score":
                    (
                        max(
                            final_scores
                        )
                        if final_scores
                        else 0.0
                    ),

                "lowest_final_score":
                    (
                        min(
                            final_scores
                        )
                        if final_scores
                        else 0.0
                    )
            },

            # =================================================
            # SKILLS
            # =================================================

            "skills": {

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    [],

                "top_skills":
                    top_skills
            },

            # =================================================
            # APPLICATION STATUS
            # =================================================

            "application_status":
                application_status,

            # =================================================
            # SCORE DISTRIBUTIONS
            # =================================================

            "resume_score_distribution":
                AnalyticsService
                ._score_distribution(
                    resume_scores
                ),

            "interview_score_distribution":
                AnalyticsService
                ._score_distribution(
                    interview_scores
                ),

            "final_score_distribution":
                AnalyticsService
                ._score_distribution(
                    final_scores
                ),

            # =================================================
            # MONTHLY
            # =================================================

            "monthly_performance":
                monthly_performance,

            # =================================================
            # INTERVIEW PERFORMANCE
            # =================================================

            "interview_performance":
                interview_performance,

            # =================================================
            # APPLICATION PERFORMANCE
            # =================================================

            "application_performance":
                application_performance,

            # =================================================
            # TIMESTAMPS
            # =================================================

            "created_at":
                now,

            "updated_at":
                now
        }

    # =====================================================
    # GENERATE STUDENT DASHBOARD
    # =====================================================

    @staticmethod
    def generate_student_dashboard(
        student_id: str
    ) -> Dict[str, Any]:

        student_object_id = (
            AnalyticsService
            ._validate_object_id(
                student_id,
                "student"
            )
        )

        # -------------------------------------------------
        # GENERATE FRESH DATA
        # -------------------------------------------------

        data = (
            AnalyticsService
            .get_student_analytics(
                student_id
            )
        )

        # -------------------------------------------------
        # DELETE ONLY THIS STUDENT'S OLD ANALYTICS
        # -------------------------------------------------

        analytics_collection.delete_many(
            {
                "student_id":
                    {
                        "$in":
                            AnalyticsService
                            ._id_values(
                                student_object_id
                            )
                    }
            }
        )

        # -------------------------------------------------
        # SAVE
        # -------------------------------------------------

        document = dict(
            data
        )

        document[
            "student_id"
        ] = student_object_id

        document[
            "created_at"
        ] = datetime.utcnow()

        document[
            "updated_at"
        ] = datetime.utcnow()

        result = (
            analytics_collection.insert_one(
                document
            )
        )

        saved = (
            analytics_collection.find_one(
                {
                    "_id":
                        result.inserted_id
                }
            )
        )

        if not saved:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to save student analytics."
                )
            )

        return (
            AnalyticsService
            ._convert_object_ids(
                saved
            )
        )

    # =====================================================
    # GET SAVED STUDENT DASHBOARD
    # =====================================================

    @staticmethod
    def get_student_dashboard(
        student_id: str
    ) -> Dict[str, Any]:

        student_object_id = (
            AnalyticsService
            ._validate_object_id(
                student_id,
                "student"
            )
        )

        dashboard = (
            analytics_collection.find_one(
                {
                    "student_id":
                        {
                            "$in":
                                AnalyticsService
                                ._id_values(
                                    student_object_id
                                )
                        }
                },
                sort=[
                    (
                        "updated_at",
                        -1
                    )
                ]
            )
        )

        # -------------------------------------------------
        # NO CACHE
        # -------------------------------------------------

        if not dashboard:

            return (
                AnalyticsService
                .get_student_analytics(
                    student_id
                )
            )

        return (
            AnalyticsService
            ._convert_object_ids(
                dashboard
            )
        )

    # =====================================================
    # REFRESH STUDENT DASHBOARD
    # =====================================================

    @staticmethod
    def refresh_student_dashboard(
        student_id: str
    ) -> Dict[str, Any]:

        student_object_id = (
            AnalyticsService
            ._validate_object_id(
                student_id,
                "student"
            )
        )

        # -------------------------------------------------
        # DELETE ONLY THIS STUDENT
        # -------------------------------------------------

        analytics_collection.delete_many(
            {
                "student_id":
                    {
                        "$in":
                            AnalyticsService
                            ._id_values(
                                student_object_id
                            )
                    }
            }
        )

        # -------------------------------------------------
        # GENERATE FRESH
        # -------------------------------------------------

        return (
            AnalyticsService
            .generate_student_dashboard(
                student_id
            )
        )

    # =====================================================
    # DELETE STUDENT DASHBOARD
    # =====================================================

    @staticmethod
    def delete_student_dashboard(
        student_id: str
    ) -> Dict[str, Any]:

        student_object_id = (
            AnalyticsService
            ._validate_object_id(
                student_id,
                "student"
            )
        )

        result = (
            analytics_collection.delete_many(
                {
                    "student_id":
                        {
                            "$in":
                                AnalyticsService
                                ._id_values(
                                    student_object_id
                                )
                        }
                }
            )
        )

        return {

            "success":
                True,

            "student_id":
                str(
                    student_object_id
                ),

            "deleted_count":
                result.deleted_count,

            "message":
                (
                    "Student analytics deleted "
                    "successfully."
                )
        }
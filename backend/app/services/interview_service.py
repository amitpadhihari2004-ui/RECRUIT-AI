from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import db

from app.services.interview_question_service import (
    InterviewQuestionService
)

from app.services.interview_evaluation_service import (
    InterviewEvaluationService
)


# =========================================================
# COLLECTION
# =========================================================

interview_collection = db["interviews"]


class InterviewService:

    # =====================================================
    # OBJECT ID
    # =====================================================

    @staticmethod
    def _object_id(value: str) -> ObjectId:

        try:
            return ObjectId(str(value))

        except Exception:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview ID."
            )

    # =====================================================
    # STRING ID
    # =====================================================

    @staticmethod
    def _string_id(value: Any) -> str:

        if isinstance(value, ObjectId):
            return str(value)

        return str(value)

    # =====================================================
    # SERIALIZE VALUE
    # =====================================================

    @staticmethod
    def _serialize_value(value):

        if isinstance(value, ObjectId):
            return str(value)

        if isinstance(value, datetime):
            return value.isoformat()

        if isinstance(value, dict):

            return {
                key:
                    InterviewService._serialize_value(
                        val
                    )
                for key, val in value.items()
            }

        if isinstance(value, list):

            return [
                InterviewService._serialize_value(
                    item
                )
                for item in value
            ]

        return value

    # =====================================================
    # SERIALIZE INTERVIEW
    # =====================================================

    @staticmethod
    def _serialize_interview(
        interview: Dict[str, Any]
    ) -> Dict[str, Any]:

        if not interview:
            return {}

        result = InterviewService._serialize_value(
            dict(interview)
        )

        if "_id" in result:

            result["id"] = str(
                result["_id"]
            )

            del result["_id"]

        return result

    # =====================================================
    # EXTRACT QUESTIONS
    # =====================================================

    @staticmethod
    def _extract_questions(
        questions: Dict[str, Any]
    ) -> List[Dict[str, Any]]:

        if not isinstance(
            questions,
            dict
        ):
            return []

        all_questions = []

        categories = [
            "technical_questions",
            "hr_questions",
            "behavioral_questions"
        ]

        for category in categories:

            category_questions = questions.get(
                category,
                []
            )

            if not isinstance(
                category_questions,
                list
            ):
                continue

            for question in category_questions:

                if not isinstance(
                    question,
                    dict
                ):
                    continue

                question_id = question.get(
                    "question_id"
                )

                question_text = question.get(
                    "question"
                )

                if question_id is None:
                    continue

                if not question_text:
                    continue

                try:

                    question_id = int(
                        question_id
                    )

                except (
                    TypeError,
                    ValueError
                ):
                    continue

                question_text = str(
                    question_text
                ).strip()

                if not question_text:
                    continue

                all_questions.append(
                    {
                        "question_id":
                            question_id,

                        "question":
                            question_text
                    }
                )

        return all_questions

    # =====================================================
    # NORMALIZE ANSWERS
    # =====================================================

    @staticmethod
    def _normalize_answers(
        answers: List[Any]
    ) -> List[Dict[str, Any]]:

        normalized_answers = []

        if not isinstance(
            answers,
            list
        ):
            return normalized_answers

        seen_ids = set()

        for answer in answers:

            if hasattr(
                answer,
                "model_dump"
            ):

                answer = answer.model_dump()

            elif isinstance(
                answer,
                dict
            ):

                answer = dict(
                    answer
                )

            else:

                continue

            try:

                question_id = int(
                    answer.get(
                        "question_id"
                    )
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            # Prevent duplicate answers
            if question_id in seen_ids:
                continue

            answer_text = (
                answer.get(
                    "answer"
                )
                or answer.get(
                    "response"
                )
                or answer.get(
                    "text"
                )
                or ""
            )

            normalized_answers.append(
                {
                    "question_id":
                        question_id,

                    "answer":
                        str(
                            answer_text
                        ).strip()
                }
            )

            seen_ids.add(
                question_id
            )

        return normalized_answers

    # =====================================================
    # VALIDATE ANSWERS
    # =====================================================

    @staticmethod
    def _validate_answers(
        questions: List[Dict[str, Any]],
        answers: List[Dict[str, Any]]
    ) -> None:

        question_ids = {
            int(
                question["question_id"]
            )
            for question in questions
        }

        answer_ids = set()

        for answer in answers:

            question_id = int(
                answer["question_id"]
            )

            if question_id not in question_ids:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Question {question_id} "
                        "does not belong to this interview."
                    )
                )

            if question_id in answer_ids:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Duplicate answer for "
                        f"question {question_id}."
                    )
                )

            answer_ids.add(
                question_id
            )

    # =====================================================
    # GENERATE AI QUESTIONS
    #
    # Used when the interview needs questions.
    # =====================================================

    @staticmethod
    def _generate_questions(
        interview: Dict[str, Any]
    ) -> Dict[str, Any]:

        resume_analysis = interview.get(
            "resume_analysis",
            {}
        )

        job = interview.get(
            "job",
            {}
        )

        interview_type = interview.get(
            "interview_type",
            "Technical"
        )

        if not isinstance(
            resume_analysis,
            dict
        ):
            resume_analysis = {}

        if not isinstance(
            job,
            dict
        ):
            job = {}

        try:

            questions = (
                InterviewQuestionService
                .generate_questions(

                    resume_analysis=
                        resume_analysis,

                    job=
                        job,

                    interview_type=
                        interview_type
                )
            )

        except HTTPException:
            raise

        except Exception as error:

            print(
                "AI question generation error:",
                repr(error)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to generate AI "
                    "interview questions."
                )
            )

        if not isinstance(
            questions,
            dict
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned invalid "
                    "interview questions."
                )
            )

        all_questions = (
            InterviewService
            ._extract_questions(
                questions
            )
        )

        if not all_questions:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI failed to generate "
                    "valid interview questions."
                )
            )

        # -------------------------------------------------
        # QUESTION COUNT
        # -------------------------------------------------

        requested_count = interview.get(
            "question_count",
            10
        )

        try:

            requested_count = int(
                requested_count
            )

        except (
            TypeError,
            ValueError
        ):

            requested_count = 10

        if requested_count < 1:
            requested_count = 10

        # -------------------------------------------------
        # LIMIT QUESTIONS
        # -------------------------------------------------

        if len(all_questions) > requested_count:

            selected_questions = (
                all_questions[
                    :requested_count
                ]
            )

            selected_ids = {
                question[
                    "question_id"
                ]
                for question
                in selected_questions
            }

            for category in [
                "technical_questions",
                "hr_questions",
                "behavioral_questions"
            ]:

                category_questions = (
                    questions.get(
                        category,
                        []
                    )
                )

                if not isinstance(
                    category_questions,
                    list
                ):
                    continue

                questions[category] = [

                    question

                    for question
                    in category_questions

                    if (
                        isinstance(
                            question,
                            dict
                        )
                        and question.get(
                            "question_id"
                        )
                        in selected_ids
                    )
                ]

        actual_count = len(
            InterviewService
            ._extract_questions(
                questions
            )
        )

        if actual_count == 0:

            raise HTTPException(
                status_code=500,
                detail=(
                    "No valid AI interview "
                    "questions were generated."
                )
            )

        return questions

    # =====================================================
    # CREATE INTERVIEW
    #
    # IMPORTANT:
    # Questions are NOT generated here.
    #
    # They are generated when the student starts
    # the interview.
    # =====================================================

    @staticmethod
    async def create_interview(
        data,
        resume_analysis: dict,
        job: dict
    ) -> Dict[str, Any]:

        if not isinstance(
            resume_analysis,
            dict
        ):
            resume_analysis = {}

        if not isinstance(
            job,
            dict
        ):
            job = {}

        # -------------------------------------------------
        # REQUIRED FIELDS
        # -------------------------------------------------

        if not data.application_id:

            raise HTTPException(
                status_code=400,
                detail="Application ID is required."
            )

        if not data.student_id:

            raise HTTPException(
                status_code=400,
                detail="Student ID is required."
            )

        if not data.job_id:

            raise HTTPException(
                status_code=400,
                detail="Job ID is required."
            )

        if not data.resume_id:

            raise HTTPException(
                status_code=400,
                detail="Resume ID is required."
            )

        # -------------------------------------------------
        # CHECK DUPLICATE ACTIVE INTERVIEW
        # -------------------------------------------------

        existing = interview_collection.find_one(
            {
                "application_id":
                    str(
                        data.application_id
                    ),

                "status": {
                    "$nin": [
                        "Cancelled",
                        "Completed"
                    ]
                }
            }
        )

        if existing:

            raise HTTPException(
                status_code=409,
                detail=(
                    "An active interview already "
                    "exists for this application."
                )
            )

        # -------------------------------------------------
        # QUESTION COUNT
        # -------------------------------------------------

        requested_count = getattr(
            data,
            "question_count",
            10
        )

        try:

            requested_count = int(
                requested_count
            )

        except (
            TypeError,
            ValueError
        ):

            requested_count = 10

        if requested_count < 1:
            requested_count = 10

        # -------------------------------------------------
        # TIME
        # -------------------------------------------------

        now = datetime.utcnow()

        # -------------------------------------------------
        # DOCUMENT
        # -------------------------------------------------

        interview_document = {

            "application_id":
                str(
                    data.application_id
                ),

            "student_id":
                str(
                    data.student_id
                ),

            "organization_id":
                (
                    str(
                        data.organization_id
                    )
                    if data.organization_id
                    else None
                ),

            "job_id":
                str(
                    data.job_id
                ),

            "resume_id":
                str(
                    data.resume_id
                ),

            "interview_type":
                data.interview_type,

            "round_name":
                data.round_name,

            "interview_mode":
                data.interview_mode,

            "interviewer_id":
                data.interviewer_id,

            "interviewer_name":
                data.interviewer_name,

            "scheduled_date":
                data.scheduled_date,

            "scheduled_time":
                data.scheduled_time,

            "duration":
                data.duration,

            "meeting_link":
                data.meeting_link,

            "question_count":
                requested_count,

            "difficulty":
                data.difficulty,

            "allow_retry":
                data.allow_retry,

            # -------------------------------------------------
            # SAVE RESUME + JOB
            # These are used later when the interview starts.
            # -------------------------------------------------

            "resume_analysis":
                resume_analysis,

            "job":
                job,

            # -------------------------------------------------
            # QUESTIONS START EMPTY
            # -------------------------------------------------

            "questions": {

                "technical_questions":
                    [],

                "hr_questions":
                    [],

                "behavioral_questions":
                    []
            },

            "answers":
                [],

            "question_feedback":
                [],

            "technical_score":
                0,

            "communication_score":
                0,

            "confidence_score":
                0,

            "overall_score":
                0,

            "strengths":
                [],

            "weaknesses":
                [],

            "recommendations":
                [],

            "overall_feedback":
                "",

            # -------------------------------------------------
            # PROCTORING SETTINGS
            # -------------------------------------------------

            "proctoring_enabled":
                getattr(
                    data,
                    "proctoring_enabled",
                    True
                ),

            "camera_required":
                getattr(
                    data,
                    "camera_required",
                    True
                ),

            "microphone_required":
                getattr(
                    data,
                    "microphone_required",
                    True
                ),

            "fullscreen_required":
                getattr(
                    data,
                    "fullscreen_required",
                    True
                ),

            "tab_switch_detection":
                getattr(
                    data,
                    "tab_switch_detection",
                    True
                ),

            "multiple_person_detection":
                getattr(
                    data,
                    "multiple_person_detection",
                    True
                ),

            "face_detection":
                getattr(
                    data,
                    "face_detection",
                    True
                ),

            # -------------------------------------------------
            # PROCTORING DATA
            #
            # Keep ALL browser + camera + computer-vision
            # counters here so the ProctoringService can update
            # the same document without missing fields.
            # -------------------------------------------------

            "proctoring": {

                "enabled":
                    getattr(
                        data,
                        "proctoring_enabled",
                        True
                    ),

                "warnings":
                    0,

                "suspicious_events":
                    0,

                # Browser monitoring
                "tab_switches":
                    0,

                "fullscreen_exits":
                    0,

                "copy_paste_events":
                    0,

                "right_click_events":
                    0,

                "developer_tools_events":
                    0,

                "keyboard_shortcut_events":
                    0,

                "window_blur_events":
                    0,

                "suspicious_activity_events":
                    0,

                # Camera / microphone
                "camera_warnings":
                    0,

                "microphone_warnings":
                    0,

                # Computer vision
                "face_detected":
                    0,

                "face_not_detected":
                    0,

                "multiple_faces_detected":
                    0,

                "camera_blocked":
                    0,

                "face_detection_failed":
                    0,

                "looking_away":
                    0,

                "head_pose_warnings":
                    0,

                "phone_detected":
                    0,

                "person_left_frame":
                    0,

                "suspicious_movement":
                    0,

                "overall_status":
                    "Normal",

                "events":
                    []
            },

            "candidate_notes":
                data.candidate_notes,

            "interviewer_notes":
                data.interviewer_notes,

            "status":
                "Scheduled",

            "confirmed_at":
                None,

            "started_at":
                None,

            "completed_at":
                None,

            "created_at":
                now,

            "updated_at":
                now
        }

        # -------------------------------------------------
        # INSERT
        # -------------------------------------------------

        result = interview_collection.insert_one(
            interview_document
        )

        interview_id = str(
            result.inserted_id
        )

        return {

            "success":
                True,

            "message":
                "AI interview created successfully.",

            "interview_id":
                interview_id,

            "status":
                "Scheduled",

            "question_count":
                requested_count,

            "questions_generated":
                False
        }

    # =====================================================
    # GET SINGLE INTERVIEW
    # =====================================================

    @staticmethod
    async def get_interview(
        interview_id: str
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return (
            InterviewService
            ._serialize_interview(
                interview
            )
        )

    # =====================================================
    # GET STUDENT INTERVIEWS
    # =====================================================

    @staticmethod
    async def get_student_interviews(
        student_id: str
    ) -> List[Dict[str, Any]]:

        if not student_id:

            raise HTTPException(
                status_code=400,
                detail="Student ID is required."
            )

        student_id = str(
            student_id
        ).strip()

        if not student_id:

            raise HTTPException(
                status_code=400,
                detail="Student ID is required."
            )

        try:

            student_ids = [
                student_id
            ]

            try:

                student_ids.append(
                    ObjectId(
                        student_id
                    )
                )

            except Exception:
                pass

            cursor = (
                interview_collection
                .find(
                    {
                        "student_id": {
                            "$in":
                                student_ids
                        }
                    }
                )
                .sort(
                    "created_at",
                    -1
                )
            )

            interviews = []

            for interview in cursor:

                interviews.append(
                    InterviewService
                    ._serialize_interview(
                        interview
                    )
                )

            print(
                "========================================"
            )

            print(
                "Student ID received:",
                student_id
            )

            print(
                "Interviews found:",
                len(interviews)
            )

            for interview in interviews:

                print(
                    "Interview:",
                    interview.get(
                        "id"
                    ),
                    "Student:",
                    interview.get(
                        "student_id"
                    ),
                    "Status:",
                    interview.get(
                        "status"
                    )
                )

            print(
                "========================================"
            )

            return interviews

        except HTTPException:
            raise

        except Exception as error:

            print(
                "Get student interviews error:",
                repr(error)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to load "
                    "student interviews."
                )
            )

    # =====================================================
    # GET ORGANIZATION INTERVIEWS
    # =====================================================

    @staticmethod
    async def get_organization_interviews(
        organization_id: str
    ) -> List[Dict[str, Any]]:

        if not organization_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Organization ID is required."
                )
            )

        organization_id = str(
            organization_id
        ).strip()

        if not organization_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Organization ID is required."
                )
            )

        try:

            cursor = (
                interview_collection
                .find(
                    {
                        "organization_id":
                            organization_id
                    }
                )
                .sort(
                    "created_at",
                    -1
                )
            )

            interviews = []

            for interview in cursor:

                interviews.append(
                    InterviewService
                    ._serialize_interview(
                        interview
                    )
                )

            return interviews

        except Exception as error:

            print(
                "Get organization interviews error:",
                repr(error)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to load "
                    "organization interviews."
                )
            )

    # =====================================================
    # GET UPCOMING INTERVIEWS
    # =====================================================

    @staticmethod
    async def get_upcoming_interviews(
        organization_id: str
    ) -> List[Dict[str, Any]]:

        if not organization_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Organization ID is required."
                )
            )

        organization_id = str(
            organization_id
        ).strip()

        try:

            cursor = (
                interview_collection
                .find(
                    {
                        "organization_id":
                            organization_id,

                        "status": {
                            "$in": [
                                "Scheduled",
                                "Confirmed",
                                "Rescheduled"
                            ]
                        }
                    }
                )
                .sort(
                    [
                        (
                            "scheduled_date",
                            1
                        ),
                        (
                            "scheduled_time",
                            1
                        )
                    ]
                )
            )

            interviews = []

            for interview in cursor:

                interviews.append(
                    InterviewService
                    ._serialize_interview(
                        interview
                    )
                )

            return interviews

        except Exception as error:

            print(
                "Get upcoming interviews error:",
                repr(error)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to load "
                    "upcoming interviews."
                )
            )

    # =====================================================
    # GET APPLICATION INTERVIEW
    # =====================================================

    @staticmethod
    async def get_application_interview(
        application_id: str
    ) -> Optional[Dict[str, Any]]:

        if not application_id:
            return None

        interview = interview_collection.find_one(

            {
                "application_id":
                    str(
                        application_id
                    ),

                "status": {
                    "$ne":
                        "Cancelled"
                }
            },

            sort=[
                (
                    "created_at",
                    -1
                )
            ]
        )

        if not interview:
            return None

        return (
            InterviewService
            ._serialize_interview(
                interview
            )
        )

    # =====================================================
    # START INTERVIEW
    #
    # IMPORTANT:
    # This is where AI questions are generated.
    # =====================================================

    @staticmethod
    async def start_interview(
        interview_id: str,
        student_id: str
    ) -> Dict[str, Any]:

        # -------------------------------------------------
        # VALIDATE INTERVIEW ID
        # -------------------------------------------------

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        # -------------------------------------------------
        # VALIDATE STUDENT ID
        # -------------------------------------------------

        if not student_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Student ID is required."
                )
            )

        student_id = str(
            student_id
        ).strip()

        # -------------------------------------------------
        # FIND INTERVIEW
        # -------------------------------------------------

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        # -------------------------------------------------
        # STUDENT AUTHORIZATION
        # -------------------------------------------------

        if str(
            interview.get(
                "student_id"
            )
        ) != student_id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to start this interview."
                )
            )

        # -------------------------------------------------
        # STATUS
        # -------------------------------------------------

        current_status = interview.get(
            "status"
        )

        if current_status == "Completed":

            raise HTTPException(
                status_code=400,
                detail=(
                    "This interview has already "
                    "been completed."
                )
            )

        if current_status == "Cancelled":

            raise HTTPException(
                status_code=400,
                detail=(
                    "This interview has been cancelled."
                )
            )

        # =================================================
        # IF ALREADY IN PROGRESS
        # =================================================
        #
        # NEVER generate a second set of questions.
        #
        # Return the existing questions.
        # =================================================

        if current_status == "In Progress":

            questions = interview.get(
                "questions",
                {}
            )

            all_questions = (
                InterviewService
                ._extract_questions(
                    questions
                )
            )

            if not all_questions:

                # -------------------------------------------------
                # Safety recovery:
                # An old interview may have In Progress status
                # but no questions.
                # -------------------------------------------------

                questions = (
                    InterviewService
                    ._generate_questions(
                        interview
                    )
                )

                now = datetime.utcnow()

                interview_collection.update_one(

                    {
                        "_id":
                            object_id
                    },

                    {
                        "$set": {

                            "questions":
                                questions,

                            "question_count":
                                len(
                                    InterviewService
                                    ._extract_questions(
                                        questions
                                    )
                                ),

                            "updated_at":
                                now
                        }
                    }
                )

                interview = (
                    interview_collection
                    .find_one(
                        {
                            "_id":
                                object_id
                        }
                    )
                )

                all_questions = (
                    InterviewService
                    ._extract_questions(
                        questions
                    )
                )

            return {

                "success":
                    True,

                "message":
                    "Interview is already in progress.",

                "interview_id":
                    interview_id,

                "status":
                    "In Progress",

                "started_at":
                    interview.get(
                        "started_at"
                    ),

                "duration":
                    interview.get(
                        "duration",
                        45
                    ),

                "question_count":
                    len(
                        all_questions
                    ),

                "difficulty":
                    interview.get(
                        "difficulty",
                        "Medium"
                    ),

                "allow_retry":
                    interview.get(
                        "allow_retry",
                        False
                    ),

                "questions":
                    questions,

                "proctoring_enabled":
                    interview.get(
                        "proctoring_enabled",
                        False
                    ),

                "camera_required":
                    interview.get(
                        "camera_required",
                        False
                    ),

                "microphone_required":
                    interview.get(
                        "microphone_required",
                        False
                    ),

                "fullscreen_required":
                    interview.get(
                        "fullscreen_required",
                        False
                    ),

                "tab_switch_detection":
                    interview.get(
                        "tab_switch_detection",
                        False
                    ),

                "multiple_person_detection":
                    interview.get(
                        "multiple_person_detection",
                        False
                    ),

                "face_detection":
                    interview.get(
                        "face_detection",
                        False
                    )
            }

        # =================================================
        # VALID START STATUS
        # =================================================

        if current_status not in [
            "Scheduled",
            "Confirmed",
            "Rescheduled"
        ]:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Interview cannot be started "
                    "in its current status."
                )
            )

        # =================================================
        # GENERATE REAL AI QUESTIONS
        # =================================================
        #
        # Questions are generated using:
        #
        # 1. Candidate resume analysis
        # 2. Job information
        # 3. Interview type
        #
        # The InterviewQuestionService you provided
        # performs the actual Groq generation.
        # =================================================

        print(
            "========================================"
        )

        print(
            "Generating AI interview questions..."
        )

        print(
            "Interview ID:",
            interview_id
        )

        print(
            "Student ID:",
            student_id
        )

        print(
            "Interview Type:",
            interview.get(
                "interview_type"
            )
        )

        print(
            "Job:",
            interview.get(
                "job",
                {}
            )
        )

        print(
            "Resume analysis available:",
            bool(
                interview.get(
                    "resume_analysis"
                )
            )
        )

        print(
            "========================================"
        )

        questions = (
            InterviewService
            ._generate_questions(
                interview
            )
        )

        all_questions = (
            InterviewService
            ._extract_questions(
                questions
            )
        )

        if not all_questions:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI failed to generate "
                    "interview questions."
                )
            )

        # =================================================
        # START TIME
        # =================================================

        now = datetime.utcnow()

        # =================================================
        # UPDATE PROCTORING
        # =================================================

        update_data = {

            "status":
                "In Progress",

            "started_at":
                now,

            "updated_at":
                now,

            "questions":
                questions,

            "question_count":
                len(
                    all_questions
                )
        }

        if interview.get(
            "proctoring_enabled",
            False
        ):

            existing_proctoring = interview.get(
                "proctoring"
            )

            if not isinstance(
                existing_proctoring,
                dict
            ):

                existing_proctoring = {}

            update_data[
                "proctoring"
            ] = {

                "enabled":
                    True,

                "warnings":
                    existing_proctoring.get(
                        "warnings",
                        0
                    ),

                "suspicious_events":
                    existing_proctoring.get(
                        "suspicious_events",
                        0
                    ),

                "tab_switches":
                    existing_proctoring.get(
                        "tab_switches",
                        0
                    ),

                "fullscreen_exits":
                    existing_proctoring.get(
                        "fullscreen_exits",
                        0
                    ),

                # Browser monitoring
                "tab_switches":
                    existing_proctoring.get(
                        "tab_switches",
                        0
                    ),

                "fullscreen_exits":
                    existing_proctoring.get(
                        "fullscreen_exits",
                        0
                    ),

                "copy_paste_events":
                    existing_proctoring.get(
                        "copy_paste_events",
                        0
                    ),

                "right_click_events":
                    existing_proctoring.get(
                        "right_click_events",
                        0
                    ),

                "developer_tools_events":
                    existing_proctoring.get(
                        "developer_tools_events",
                        0
                    ),

                "keyboard_shortcut_events":
                    existing_proctoring.get(
                        "keyboard_shortcut_events",
                        0
                    ),

                "window_blur_events":
                    existing_proctoring.get(
                        "window_blur_events",
                        0
                    ),

                "suspicious_activity_events":
                    existing_proctoring.get(
                        "suspicious_activity_events",
                        0
                    ),

                # Camera / microphone
                "camera_warnings":
                    existing_proctoring.get(
                        "camera_warnings",
                        0
                    ),

                "microphone_warnings":
                    existing_proctoring.get(
                        "microphone_warnings",
                        0
                    ),

                # Computer vision
                "face_detected":
                    existing_proctoring.get(
                        "face_detected",
                        0
                    ),

                "face_not_detected":
                    existing_proctoring.get(
                        "face_not_detected",
                        0
                    ),

                "multiple_faces_detected":
                    existing_proctoring.get(
                        "multiple_faces_detected",
                        existing_proctoring.get(
                            "multiple_person_detected",
                            0
                        )
                    ),

                "camera_blocked":
                    existing_proctoring.get(
                        "camera_blocked",
                        0
                    ),

                "face_detection_failed":
                    existing_proctoring.get(
                        "face_detection_failed",
                        0
                    ),

                "looking_away":
                    existing_proctoring.get(
                        "looking_away",
                        0
                    ),

                "head_pose_warnings":
                    existing_proctoring.get(
                        "head_pose_warnings",
                        0
                    ),

                "phone_detected":
                    existing_proctoring.get(
                        "phone_detected",
                        0
                    ),

                "person_left_frame":
                    existing_proctoring.get(
                        "person_left_frame",
                        0
                    ),

                "suspicious_movement":
                    existing_proctoring.get(
                        "suspicious_movement",
                        0
                    ),

                "overall_status":
                    existing_proctoring.get(
                        "overall_status",
                        "Normal"
                    ),

                "events":
                    existing_proctoring.get(
                        "events",
                        []
                    )
            }

        # =================================================
        # SAVE STARTED INTERVIEW
        # =================================================

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        # =================================================
        # GET UPDATED INTERVIEW
        # =================================================

        updated = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not updated:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        print(
            "========================================"
        )

        print(
            "AI INTERVIEW STARTED"
        )

        print(
            "Questions generated:",
            len(
                all_questions
            )
        )

        print(
            "Question IDs:",
            [
                question["question_id"]
                for question
                in all_questions
            ]
        )

        print(
            "========================================"
        )

        # =================================================
        # RETURN TO FRONTEND
        # =================================================

        return {

            "success":
                True,

            "message":
                "AI interview started successfully.",

            "interview_id":
                interview_id,

            "status":
                updated.get(
                    "status",
                    "In Progress"
                ),

            "started_at":
                updated.get(
                    "started_at"
                ),

            "duration":
                updated.get(
                    "duration",
                    45
                ),

            "question_count":
                len(
                    all_questions
                ),

            "difficulty":
                updated.get(
                    "difficulty",
                    "Medium"
                ),

            "allow_retry":
                updated.get(
                    "allow_retry",
                    False
                ),

            # IMPORTANT:
            # Frontend receives actual AI-generated questions.
            "questions":
                updated.get(
                    "questions",
                    {}
                ),

            # =================================================
            # PROCTORING
            # =================================================

            "proctoring_enabled":
                updated.get(
                    "proctoring_enabled",
                    False
                ),

            "camera_required":
                updated.get(
                    "camera_required",
                    False
                ),

            "microphone_required":
                updated.get(
                    "microphone_required",
                    False
                ),

            "fullscreen_required":
                updated.get(
                    "fullscreen_required",
                    False
                ),

            "tab_switch_detection":
                updated.get(
                    "tab_switch_detection",
                    False
                ),

            "multiple_person_detection":
                updated.get(
                    "multiple_person_detection",
                    False
                ),

            "face_detection":
                updated.get(
                    "face_detection",
                    False
                )
        }

    # =====================================================
    # SAVE / UPDATE ANSWERS
    # =====================================================

    @staticmethod
    async def save_answers(
        interview_id: str,
        student_id: str,
        answers: List[Any]
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        if str(
            interview.get(
                "student_id"
            )
        ) != str(student_id):

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to update this interview."
                )
            )

        if interview.get(
            "status"
        ) not in [
            "Scheduled",
            "Confirmed",
            "In Progress",
            "Rescheduled"
        ]:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Answers cannot be updated "
                    "for this interview."
                )
            )

        normalized_answers = (
            InterviewService
            ._normalize_answers(
                answers
            )
        )

        if not normalized_answers:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No valid answers provided."
                )
            )

        questions = (
            InterviewService
            ._extract_questions(
                interview.get(
                    "questions",
                    {}
                )
            )
        )

        if not questions:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Interview does not contain "
                    "valid questions."
                )
            )

        InterviewService._validate_answers(
            questions,
            normalized_answers
        )

        interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "answers":
                        normalized_answers,

                    "status":
                        "In Progress",

                    "updated_at":
                        datetime.utcnow()
                }
            }
        )

        return {

            "success":
                True,

            "message":
                "Interview answers saved successfully.",

            "interview_id":
                interview_id,

            "answers":
                normalized_answers
        }

    # =====================================================
    # SUBMIT INTERVIEW
    # =====================================================

    @staticmethod
    async def submit_interview(
        interview_id: str,
        student_id: str,
        answers: List[Any],
        resume_analysis: dict,
        job: dict
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        if str(
            interview.get(
                "student_id"
            )
        ) != str(student_id):

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to submit this interview."
                )
            )

        current_status = interview.get(
            "status"
        )

        if current_status == "Completed":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Interview has already "
                    "been submitted."
                )
            )

        if current_status == "Cancelled":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Cancelled interview cannot "
                    "be submitted."
                )
            )

        if current_status not in [
            "Scheduled",
            "Confirmed",
            "In Progress",
            "Rescheduled"
        ]:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Interview cannot be submitted "
                    "in its current status."
                )
            )

        # -------------------------------------------------
        # FALLBACK RESUME
        # -------------------------------------------------

        if (
            not isinstance(
                resume_analysis,
                dict
            )
            or not resume_analysis
        ):

            resume_analysis = interview.get(
                "resume_analysis",
                {}
            )

        if not isinstance(
            resume_analysis,
            dict
        ):

            resume_analysis = {}

        # -------------------------------------------------
        # FALLBACK JOB
        # -------------------------------------------------

        if (
            not isinstance(
                job,
                dict
            )
            or not job
        ):

            job = interview.get(
                "job",
                {}
            )

        if not isinstance(
            job,
            dict
        ):

            job = {}

        # -------------------------------------------------
        # ANSWERS
        # -------------------------------------------------

        normalized_answers = (
            InterviewService
            ._normalize_answers(
                answers
            )
        )

        # -------------------------------------------------
        # QUESTIONS
        # -------------------------------------------------

        all_questions = (
            InterviewService
            ._extract_questions(
                interview.get(
                    "questions",
                    {}
                )
            )
        )

        if not all_questions:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Interview does not contain "
                    "valid questions."
                )
            )

        # -------------------------------------------------
        # VALIDATE ANSWERS
        # -------------------------------------------------

        if normalized_answers:

            InterviewService._validate_answers(
                all_questions,
                normalized_answers
            )

        # -------------------------------------------------
        # AI EVALUATION
        # -------------------------------------------------

        try:

            evaluation = (
                InterviewEvaluationService
                .evaluate_interview(

                    questions=
                        all_questions,

                    answers=
                        normalized_answers,

                    resume_analysis=
                        resume_analysis,

                    job=
                        job
                )
            )

        except HTTPException:
            raise

        except Exception as error:

            print(
                "Interview evaluation error:",
                repr(error)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI evaluation failed. "
                    "Please try again."
                )
            )

        if not isinstance(
            evaluation,
            dict
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI evaluation returned "
                    "invalid data."
                )
            )

        # -------------------------------------------------
        # COMPLETE
        # -------------------------------------------------

        completed_at = datetime.utcnow()

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "answers":
                        normalized_answers,

                    "question_feedback":
                        evaluation.get(
                            "question_feedback",
                            []
                        ),

                    "technical_score":
                        evaluation.get(
                            "technical_score",
                            0
                        ),

                    "communication_score":
                        evaluation.get(
                            "communication_score",
                            0
                        ),

                    "confidence_score":
                        evaluation.get(
                            "confidence_score",
                            0
                        ),

                    "overall_score":
                        evaluation.get(
                            "overall_score",
                            0
                        ),

                    "strengths":
                        evaluation.get(
                            "strengths",
                            []
                        ),

                    "weaknesses":
                        evaluation.get(
                            "weaknesses",
                            []
                        ),

                    "recommendations":
                        evaluation.get(
                            "recommendations",
                            []
                        ),

                    "overall_feedback":
                        evaluation.get(
                            "overall_feedback",
                            ""
                        ),

                    "status":
                        "Completed",

                    "completed_at":
                        completed_at,

                    "updated_at":
                        completed_at
                }
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                (
                    "Interview submitted and "
                    "evaluated successfully."
                ),

            "interview_id":
                interview_id,

            "status":
                "Completed",

            "completed_at":
                completed_at,

            "evaluation":
                evaluation
        }

    # =====================================================
    # COMPLETE INTERVIEW
    # =====================================================

    @staticmethod
    async def complete_interview(
        interview_id: str
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        current_status = interview.get(
            "status"
        )

        if current_status == "Cancelled":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Cancelled interview cannot "
                    "be completed."
                )
            )

        if current_status == "Completed":

            return {

                "success":
                    True,

                "message":
                    "Interview is already completed.",

                "interview_id":
                    interview_id,

                "status":
                    "Completed"
            }

        if current_status not in [
            "Scheduled",
            "Confirmed",
            "In Progress",
            "Rescheduled"
        ]:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Interview cannot be completed "
                    "in its current status."
                )
            )

        now = datetime.utcnow()

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "status":
                        "Completed",

                    "completed_at":
                        now,

                    "updated_at":
                        now
                }
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                "Interview completed successfully.",

            "interview_id":
                interview_id,

            "status":
                "Completed",

            "completed_at":
                now
        }

    # =====================================================
    # UPDATE INTERVIEW
    # =====================================================

    @staticmethod
    async def update_interview(
        interview_id: str,
        data
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        if hasattr(
            data,
            "model_dump"
        ):

            update_data = data.model_dump(
                exclude_unset=True
            )

        elif isinstance(
            data,
            dict
        ):

            update_data = dict(
                data
            )

        else:

            update_data = {}

        if not update_data:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No update data provided."
                )
            )

        update_data = {

            key:
                value

            for key, value
            in update_data.items()

            if value is not None
        }

        if not update_data:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No valid update data provided."
                )
            )

        update_data[
            "updated_at"
        ] = datetime.utcnow()

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                "Interview updated successfully.",

            "interview_id":
                interview_id
        }

    # =====================================================
    # UPDATE STATUS
    # =====================================================

    @staticmethod
    async def update_status(
        interview_id: str,
        new_status: str
    ) -> Dict[str, Any]:

        allowed_statuses = [
            "Scheduled",
            "Confirmed",
            "In Progress",
            "Completed",
            "Cancelled",
            "Rescheduled"
        ]

        new_status = str(
            new_status
        ).strip()

        if new_status not in allowed_statuses:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid interview status. "
                    f"Allowed statuses: "
                    f"{allowed_statuses}"
                )
            )

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        update_data = {

            "status":
                new_status,

            "updated_at":
                datetime.utcnow()
        }

        if new_status == "Confirmed":

            update_data[
                "confirmed_at"
            ] = datetime.utcnow()

        if new_status == "Completed":

            update_data[
                "completed_at"
            ] = datetime.utcnow()

        if new_status == "Cancelled":

            update_data[
                "cancelled_at"
            ] = datetime.utcnow()

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                "Interview status updated successfully.",

            "interview_id":
                interview_id,

            "status":
                new_status
        }

    # =====================================================
    # RESCHEDULE INTERVIEW
    # =====================================================

    @staticmethod
    async def reschedule_interview(
        interview_id: str,
        scheduled_date: str,
        scheduled_time: str,
        meeting_link: Optional[str] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        if interview.get(
            "status"
        ) == "Completed":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Completed interview cannot "
                    "be rescheduled."
                )
            )

        if interview.get(
            "status"
        ) == "Cancelled":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Cancelled interview cannot "
                    "be rescheduled."
                )
            )

        if not scheduled_date:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Scheduled date is required."
                )
            )

        if not scheduled_time:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Scheduled time is required."
                )
            )

        update_data = {

            "scheduled_date":
                scheduled_date,

            "scheduled_time":
                scheduled_time,

            "status":
                "Rescheduled",

            "updated_at":
                datetime.utcnow()
        }

        if meeting_link is not None:

            update_data[
                "meeting_link"
            ] = meeting_link

        if reason:

            update_data[
                "reschedule_reason"
            ] = reason

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                "Interview rescheduled successfully.",

            "interview_id":
                interview_id,

            "status":
                "Rescheduled"
        }

    # =====================================================
    # CANCEL INTERVIEW
    # =====================================================

    @staticmethod
    async def cancel_interview(
        interview_id: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:

        object_id = (
            InterviewService
            ._object_id(
                interview_id
            )
        )

        interview = interview_collection.find_one(
            {
                "_id":
                    object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        if interview.get(
            "status"
        ) == "Completed":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Completed interview cannot "
                    "be cancelled."
                )
            )

        if interview.get(
            "status"
        ) == "Cancelled":

            return {

                "success":
                    True,

                "message":
                    "Interview is already cancelled.",

                "interview_id":
                    interview_id,

                "status":
                    "Cancelled"
            }

        now = datetime.utcnow()

        update_data = {

            "status":
                "Cancelled",

            "updated_at":
                now,

            "cancelled_at":
                now
        }

        if reason:

            update_data[
                "cancellation_reason"
            ] = reason

        result = interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Interview not found."
            )

        return {

            "success":
                True,

            "message":
                "Interview cancelled successfully.",

            "interview_id":
                interview_id,

            "status":
                "Cancelled"
        }

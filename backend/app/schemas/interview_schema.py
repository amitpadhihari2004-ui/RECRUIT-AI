from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# =========================================================
# INTERVIEW QUESTION
# =========================================================

class InterviewQuestion(BaseModel):

    question_id: int

    question: str

    category: Optional[str] = "Technical"

    difficulty: Optional[str] = "Medium"

    expected_topics: List[str] = Field(
        default_factory=list
    )

    time_limit: Optional[int] = None


# =========================================================
# CREATE INTERVIEW
# =========================================================

class InterviewCreate(BaseModel):

    # -----------------------------------------------------
    # IDENTIFICATION
    # -----------------------------------------------------

    application_id: str

    student_id: str

    organization_id: Optional[str] = None

    job_id: str

    resume_id: str

    # -----------------------------------------------------
    # INTERVIEW INFORMATION
    # -----------------------------------------------------

    interview_type: str = "Technical"

    round_name: str = "Technical Interview"

    interview_mode: str = "AI"

    # -----------------------------------------------------
    # INTERVIEWER
    # -----------------------------------------------------

    interviewer_id: Optional[str] = None

    interviewer_name: Optional[str] = None

    # -----------------------------------------------------
    # SCHEDULE
    # -----------------------------------------------------

    scheduled_date: Optional[str] = None

    scheduled_time: Optional[str] = None

    duration: int = Field(
        default=45,
        ge=5,
        le=180
    )

    meeting_link: Optional[str] = None

    # -----------------------------------------------------
    # AI INTERVIEW SETTINGS
    # -----------------------------------------------------

    question_count: int = Field(
        default=10,
        ge=1,
        le=50
    )

    difficulty: str = "Medium"

    allow_retry: bool = False

    # -----------------------------------------------------
    # LEVEL 1 PROCTORING
    # -----------------------------------------------------

    proctoring_enabled: bool = True

    camera_required: bool = True

    microphone_required: bool = True

    fullscreen_required: bool = True

    tab_switch_detection: bool = True

    multiple_person_detection: bool = True

    face_detection: bool = True

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION
    # -----------------------------------------------------

    face_presence_detection: bool = True

    face_not_detected_detection: bool = True

    multiple_faces_detection: bool = True

    camera_block_detection: bool = True

    face_detection_failure_detection: bool = True

    looking_away_detection: bool = True

    head_pose_detection: bool = True

    phone_detection: bool = True

    person_left_frame_detection: bool = True

    suspicious_movement_detection: bool = True

    # -----------------------------------------------------
    # AI INPUT
    # -----------------------------------------------------

    resume_analysis: Dict[str, Any] = Field(
        default_factory=dict
    )

    job: Dict[str, Any] = Field(
        default_factory=dict
    )

    # -----------------------------------------------------
    # NOTES
    # -----------------------------------------------------

    candidate_notes: Optional[str] = None

    interviewer_notes: Optional[str] = None


# =========================================================
# UPDATE INTERVIEW
# =========================================================

class InterviewUpdate(BaseModel):

    # -----------------------------------------------------
    # INTERVIEW INFORMATION
    # -----------------------------------------------------

    interview_type: Optional[str] = None

    round_name: Optional[str] = None

    interview_mode: Optional[str] = None

    # -----------------------------------------------------
    # INTERVIEWER
    # -----------------------------------------------------

    interviewer_id: Optional[str] = None

    interviewer_name: Optional[str] = None

    # -----------------------------------------------------
    # SCHEDULE
    # -----------------------------------------------------

    scheduled_date: Optional[str] = None

    scheduled_time: Optional[str] = None

    duration: Optional[int] = Field(
        default=None,
        ge=5,
        le=180
    )

    meeting_link: Optional[str] = None

    # -----------------------------------------------------
    # AI INTERVIEW SETTINGS
    # -----------------------------------------------------

    question_count: Optional[int] = Field(
        default=None,
        ge=1,
        le=50
    )

    difficulty: Optional[str] = None

    allow_retry: Optional[bool] = None

    # -----------------------------------------------------
    # LEVEL 1 PROCTORING
    # -----------------------------------------------------

    proctoring_enabled: Optional[bool] = None

    camera_required: Optional[bool] = None

    microphone_required: Optional[bool] = None

    fullscreen_required: Optional[bool] = None

    tab_switch_detection: Optional[bool] = None

    multiple_person_detection: Optional[bool] = None

    face_detection: Optional[bool] = None

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION
    # -----------------------------------------------------

    face_presence_detection: Optional[bool] = None

    face_not_detected_detection: Optional[bool] = None

    multiple_faces_detection: Optional[bool] = None

    camera_block_detection: Optional[bool] = None

    face_detection_failure_detection: Optional[bool] = None

    looking_away_detection: Optional[bool] = None

    head_pose_detection: Optional[bool] = None

    phone_detection: Optional[bool] = None

    person_left_frame_detection: Optional[bool] = None

    suspicious_movement_detection: Optional[bool] = None

    # -----------------------------------------------------
    # NOTES
    # -----------------------------------------------------

    candidate_notes: Optional[str] = None

    interviewer_notes: Optional[str] = None


# =========================================================
# UPDATE INTERVIEW STATUS
# =========================================================

class InterviewStatusUpdate(BaseModel):

    status: str


# =========================================================
# RESCHEDULE INTERVIEW
# =========================================================

class InterviewReschedule(BaseModel):

    scheduled_date: str

    scheduled_time: str

    meeting_link: Optional[str] = None

    reason: Optional[str] = None


# =========================================================
# START INTERVIEW
# =========================================================

class InterviewStart(BaseModel):

    # -----------------------------------------------------
    # LEVEL 1 PROCTORING
    # -----------------------------------------------------

    proctoring_enabled: Optional[bool] = True

    camera_required: Optional[bool] = True

    microphone_required: Optional[bool] = True

    fullscreen_required: Optional[bool] = True

    tab_switch_detection: Optional[bool] = True

    multiple_person_detection: Optional[bool] = True

    face_detection: Optional[bool] = True

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION
    # -----------------------------------------------------

    face_presence_detection: Optional[bool] = True

    face_not_detected_detection: Optional[bool] = True

    multiple_faces_detection: Optional[bool] = True

    camera_block_detection: Optional[bool] = True

    face_detection_failure_detection: Optional[bool] = True

    looking_away_detection: Optional[bool] = True

    head_pose_detection: Optional[bool] = True

    phone_detection: Optional[bool] = True

    person_left_frame_detection: Optional[bool] = True

    suspicious_movement_detection: Optional[bool] = True


# =========================================================
# INTERVIEW ANSWER
# =========================================================

class InterviewAnswer(BaseModel):

    question_id: int

    answer: str = ""

    started_at: Optional[datetime] = None

    submitted_at: Optional[datetime] = None

    time_taken: Optional[int] = None


# =========================================================
# SUBMIT INTERVIEW
# =========================================================

class InterviewSubmit(BaseModel):

    answers: List[InterviewAnswer] = Field(
        default_factory=list
    )

    resume_analysis: Dict[str, Any] = Field(
        default_factory=dict
    )

    job: Dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# UPDATE ANSWERS
# =========================================================

class InterviewAnswerUpdate(BaseModel):

    answers: List[InterviewAnswer] = Field(
        default_factory=list
    )


# =========================================================
# QUESTION FEEDBACK
# =========================================================

class QuestionFeedback(BaseModel):

    question_id: int

    score: float = Field(
        default=0,
        ge=0,
        le=10
    )

    feedback: str = ""


# =========================================================
# PROCTORING EVENT
# =========================================================

class ProctoringEvent(BaseModel):

    event_type: str

    timestamp: Optional[datetime] = None

    severity: str = "low"

    message: Optional[str] = None

    metadata: Dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# PROCTORING SUMMARY
# =========================================================

class ProctoringSummary(BaseModel):

    enabled: bool = True

    # -----------------------------------------------------
    # GENERAL
    # -----------------------------------------------------

    warnings: int = 0

    suspicious_events: int = 0

    # -----------------------------------------------------
    # LEVEL 1 - BROWSER MONITORING
    # -----------------------------------------------------

    tab_switches: int = 0

    fullscreen_exits: int = 0

    copy_paste_events: int = 0

    right_click_events: int = 0

    developer_tools_events: int = 0

    keyboard_shortcut_events: int = 0

    window_blur_events: int = 0

    suspicious_activity_events: int = 0

    # -----------------------------------------------------
    # LEVEL 1 - CAMERA / MICROPHONE
    # -----------------------------------------------------

    camera_warnings: int = 0

    microphone_warnings: int = 0

    # -----------------------------------------------------
    # LEVEL 2 - COMPUTER VISION
    # -----------------------------------------------------

    face_detected: int = 0

    face_not_detected: int = 0

    multiple_faces_detected: int = 0

    camera_blocked: int = 0

    face_detection_failed: int = 0

    looking_away: int = 0

    head_pose_warnings: int = 0

    phone_detected: int = 0

    person_left_frame: int = 0

    suspicious_movement: int = 0

    # -----------------------------------------------------
    # OVERALL STATUS
    # -----------------------------------------------------

    overall_status: str = "Normal"

    # -----------------------------------------------------
    # EVENT HISTORY
    # -----------------------------------------------------

    events: List[ProctoringEvent] = Field(
        default_factory=list
    )


# =========================================================
# INTERVIEW EVALUATION
# =========================================================

class InterviewEvaluation(BaseModel):

    question_feedback: List[QuestionFeedback] = Field(
        default_factory=list
    )

    technical_score: int = Field(
        default=0,
        ge=0,
        le=100
    )

    communication_score: int = Field(
        default=0,
        ge=0,
        le=100
    )

    confidence_score: int = Field(
        default=0,
        ge=0,
        le=100
    )

    overall_score: int = Field(
        default=0,
        ge=0,
        le=100
    )

    strengths: List[str] = Field(
        default_factory=list
    )

    weaknesses: List[str] = Field(
        default_factory=list
    )

    recommendations: List[str] = Field(
        default_factory=list
    )

    overall_feedback: str = ""


# =========================================================
# PROCTORING EVENT CREATE
# LEVEL 1
# =========================================================

class ProctoringEventCreate(BaseModel):

    event_type: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    severity: str = Field(
        default="low",
        max_length=20
    )

    message: Optional[str] = Field(
        default=None,
        max_length=500
    )

    metadata: Dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# COMPUTER VISION EVENT CREATE
# LEVEL 2
# =========================================================

class ComputerVisionEventCreate(BaseModel):

    event_type: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    # -----------------------------------------------------
    # IMPORTANT:
    # None means ComputerVisionService decides the
    # default severity.
    #
    # Example:
    #
    # multiple_faces_detected -> high
    # phone_detected          -> high
    # looking_away            -> medium
    #
    # -----------------------------------------------------

    severity: Optional[str] = Field(
        default=None,
        max_length=20
    )

    message: Optional[str] = Field(
        default=None,
        max_length=500
    )

    metadata: Dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# INTERVIEW RESPONSE
# =========================================================

class InterviewResponse(BaseModel):

    # -----------------------------------------------------
    # IDENTIFICATION
    # -----------------------------------------------------

    id: str

    application_id: str

    student_id: str

    organization_id: Optional[str] = None

    job_id: str

    resume_id: str

    # -----------------------------------------------------
    # INTERVIEW INFORMATION
    # -----------------------------------------------------

    interview_type: str

    round_name: Optional[str] = None

    interview_mode: str = "AI"

    # -----------------------------------------------------
    # INTERVIEWER
    # -----------------------------------------------------

    interviewer_id: Optional[str] = None

    interviewer_name: Optional[str] = None

    # -----------------------------------------------------
    # SCHEDULE
    # -----------------------------------------------------

    scheduled_date: Optional[str] = None

    scheduled_time: Optional[str] = None

    duration: int = 45

    meeting_link: Optional[str] = None

    # -----------------------------------------------------
    # AI INTERVIEW
    # -----------------------------------------------------

    question_count: int = 10

    difficulty: str = "Medium"

    allow_retry: bool = False

    questions: Dict[str, Any] = Field(
        default_factory=dict
    )

    answers: List[InterviewAnswer] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # AI EVALUATION
    # -----------------------------------------------------

    question_feedback: List[QuestionFeedback] = Field(
        default_factory=list
    )

    technical_score: int = 0

    communication_score: int = 0

    confidence_score: int = 0

    overall_score: int = 0

    strengths: List[str] = Field(
        default_factory=list
    )

    weaknesses: List[str] = Field(
        default_factory=list
    )

    recommendations: List[str] = Field(
        default_factory=list
    )

    overall_feedback: str = ""

    # -----------------------------------------------------
    # LEVEL 1 PROCTORING SETTINGS
    # -----------------------------------------------------

    proctoring_enabled: bool = True

    camera_required: bool = True

    microphone_required: bool = True

    fullscreen_required: bool = True

    tab_switch_detection: bool = True

    multiple_person_detection: bool = True

    face_detection: bool = True

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION SETTINGS
    # -----------------------------------------------------

    face_presence_detection: bool = True

    face_not_detected_detection: bool = True

    multiple_faces_detection: bool = True

    camera_block_detection: bool = True

    face_detection_failure_detection: bool = True

    looking_away_detection: bool = True

    head_pose_detection: bool = True

    phone_detection: bool = True

    person_left_frame_detection: bool = True

    suspicious_movement_detection: bool = True

    # -----------------------------------------------------
    # PROCTORING DATA
    # -----------------------------------------------------

    proctoring: Optional[ProctoringSummary] = None

    # -----------------------------------------------------
    # NOTES
    # -----------------------------------------------------

    candidate_notes: Optional[str] = None

    interviewer_notes: Optional[str] = None

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    status: str

    # -----------------------------------------------------
    # TIMESTAMPS
    # -----------------------------------------------------

    started_at: Optional[datetime] = None

    completed_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime


# =========================================================
# INTERVIEW SUMMARY
# =========================================================

class InterviewSummary(BaseModel):

    id: str

    application_id: str

    student_id: str

    job_id: str

    interview_type: str

    round_name: Optional[str] = None

    interview_mode: str = "AI"

    status: str

    overall_score: int = 0

    scheduled_date: Optional[str] = None

    scheduled_time: Optional[str] = None

    proctoring_enabled: bool = True

    # -----------------------------------------------------
    # PROCTORING SUMMARY
    # -----------------------------------------------------

    proctoring_status: str = "Normal"

    suspicious_events: int = 0

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION SUMMARY
    # -----------------------------------------------------

    face_not_detected: int = 0

    multiple_faces_detected: int = 0

    camera_blocked: int = 0

    looking_away: int = 0

    head_pose_warnings: int = 0

    phone_detected: int = 0

    person_left_frame: int = 0

    suspicious_movement: int = 0

    created_at: datetime


# =========================================================
# STATUS RESPONSE
# =========================================================

class InterviewStatusResponse(BaseModel):

    success: bool

    message: str

    status: Optional[str] = None


# =========================================================
# CREATE RESPONSE
# =========================================================

class InterviewCreateResponse(BaseModel):

    success: bool

    message: str

    interview_id: str

    status: str

    questions: Dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# START INTERVIEW RESPONSE
# =========================================================

class InterviewStartResponse(BaseModel):

    success: bool

    message: str

    interview_id: str

    status: str

    questions: Dict[str, Any] = Field(
        default_factory=dict
    )

    # -----------------------------------------------------
    # LEVEL 1 PROCTORING
    # -----------------------------------------------------

    proctoring_enabled: bool = True

    camera_required: bool = True

    microphone_required: bool = True

    fullscreen_required: bool = True

    tab_switch_detection: bool = True

    multiple_person_detection: bool = True

    face_detection: bool = True

    # -----------------------------------------------------
    # LEVEL 2 COMPUTER VISION
    # -----------------------------------------------------

    face_presence_detection: bool = True

    face_not_detected_detection: bool = True

    multiple_faces_detection: bool = True

    camera_block_detection: bool = True

    face_detection_failure_detection: bool = True

    looking_away_detection: bool = True

    head_pose_detection: bool = True

    phone_detection: bool = True

    person_left_frame_detection: bool = True

    suspicious_movement_detection: bool = True

    # -----------------------------------------------------
    # TIMESTAMP
    # -----------------------------------------------------

    started_at: Optional[datetime] = None


# =========================================================
# SUBMIT INTERVIEW RESPONSE
# =========================================================

class InterviewSubmitResponse(BaseModel):

    success: bool

    message: str

    interview_id: str

    status: str

    completed_at: Optional[datetime] = None


# =========================================================
# EVALUATION RESPONSE
# =========================================================

class InterviewEvaluationResponse(BaseModel):

    success: bool

    message: str

    interview_id: Optional[str] = None

    status: Optional[str] = None

    evaluation: InterviewEvaluation


# =========================================================
# PROCTORING RESPONSE
# =========================================================

class ProctoringResponse(BaseModel):

    success: bool

    message: str

    interview_id: str

    proctoring: Optional[ProctoringSummary] = None


# =========================================================
# GENERIC MESSAGE RESPONSE
# =========================================================

class InterviewMessageResponse(BaseModel):

    success: bool

    message: str
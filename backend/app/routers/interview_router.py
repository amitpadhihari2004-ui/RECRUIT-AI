from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Body, HTTPException

from app.services.interview_service import InterviewService
from app.services.proctoring_service import ProctoringService
from app.services.computer_vision_service import ComputerVisionService

from app.schemas.interview_schema import (
    InterviewCreate,
    InterviewSubmit,
    InterviewAnswerUpdate,
    InterviewUpdate,
    InterviewStatusUpdate,
    InterviewReschedule,
    ProctoringEventCreate,
    ComputerVisionEventCreate,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"]
)


# =========================================================
# CREATE AI INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.post("/")
async def create_interview(
    data: InterviewCreate,
    resume_analysis: dict = Body(default={}),
    job: dict = Body(default={})
):
    """
    Create a scheduled AI interview.

    AI questions are generated when the student
    starts the interview.
    """

    return await InterviewService.create_interview(

        data=data,

        resume_analysis=resume_analysis,

        job=job
    )


# =========================================================
# GET ALL INTERVIEWS
# =========================================================

@router.get("/")
async def get_all_interviews():

    return {

        "success": True,

        "message": (
            "Use /organization/{organization_id}, "
            "/student/{student_id}, or "
            "/application/{application_id} "
            "to retrieve interviews."
        )
    }


# =========================================================
# GET INTERVIEW BY APPLICATION
# =========================================================

@router.get(
    "/application/{application_id}"
)
async def get_interview_by_application(
    application_id: str
):

    interview = (
        await InterviewService
        .get_application_interview(
            application_id
        )
    )

    if not interview:

        return {

            "success": True,

            "interview": None
        }

    return {

        "success": True,

        "interview": interview
    }


# =========================================================
# GET INTERVIEWS BY STUDENT
# =========================================================

@router.get(
    "/student/{student_id}"
)
async def get_student_interviews(
    student_id: str
):

    if not student_id:

        raise HTTPException(
            status_code=400,
            detail="Student ID is required."
        )

    interviews = (
        await InterviewService
        .get_student_interviews(
            student_id
        )
    )

    return {

        "success": True,

        "count": len(
            interviews
        ),

        "interviews":
            interviews
    }


# =========================================================
# GET INTERVIEWS BY ORGANIZATION
# =========================================================

@router.get(
    "/organization/{organization_id}"
)
async def get_organization_interviews(
    organization_id: str
):

    if not organization_id:

        raise HTTPException(
            status_code=400,
            detail="Organization ID is required."
        )

    interviews = (
        await InterviewService
        .get_organization_interviews(
            organization_id
        )
    )

    return {

        "success": True,

        "count": len(
            interviews
        ),

        "interviews":
            interviews
    }


# =========================================================
# GET UPCOMING INTERVIEWS
# ORGANIZATION SIDE
# =========================================================

@router.get(
    "/upcoming/organization/{organization_id}"
)
async def get_upcoming_interviews(
    organization_id: str
):

    if not organization_id:

        raise HTTPException(
            status_code=400,
            detail="Organization ID is required."
        )

    interviews = (
        await InterviewService
        .get_organization_interviews(
            organization_id
        )
    )

    upcoming = []

    now = datetime.now()

    for interview in interviews:

        interview_status = interview.get(
            "status",
            ""
        )

        # -------------------------------------------------
        # ONLY ACTIVE INTERVIEWS
        # -------------------------------------------------

        if interview_status not in [
            "Scheduled",
            "Confirmed",
            "Rescheduled"
        ]:

            continue

        scheduled_date = interview.get(
            "scheduled_date"
        )

        scheduled_time = interview.get(
            "scheduled_time"
        )

        # -------------------------------------------------
        # DATE NOT AVAILABLE
        # -------------------------------------------------

        if not scheduled_date:

            upcoming.append(
                interview
            )

            continue

        try:

            if scheduled_time:

                interview_datetime = (
                    datetime.strptime(
                        f"{scheduled_date} {scheduled_time}",
                        "%Y-%m-%d %H:%M"
                    )
                )

            else:

                interview_datetime = (
                    datetime.strptime(
                        str(
                            scheduled_date
                        ),
                        "%Y-%m-%d"
                    )
                )

            if interview_datetime >= now:

                upcoming.append(
                    interview
                )

        except Exception:

            # Do not hide interview if
            # date format is different.

            upcoming.append(
                interview
            )

    return {

        "success": True,

        "count": len(
            upcoming
        ),

        "interviews":
            upcoming
    }


# =========================================================
# =========================================================
# PROCTORING - STATIC CV ROUTES
# =========================================================
#
# IMPORTANT:
#
# These routes MUST appear BEFORE:
#
# /{interview_id}
#
# Otherwise FastAPI may interpret:
#
# /proctoring/cv-events/supported
#
# as:
#
# interview_id = "proctoring"
#
# =========================================================


# =========================================================
# GET SUPPORTED COMPUTER VISION EVENTS
# =========================================================
#
# GET:
#
# /interviews/proctoring/cv-events/supported
#
# =========================================================

@router.get(
    "/proctoring/cv-events/supported"
)
async def get_supported_computer_vision_events():

    return (
        ComputerVisionService
        .get_supported_events()
    )


# =========================================================
# =========================================================
# GET SINGLE INTERVIEW
# =========================================================
#
# IMPORTANT:
# Keep this dynamic route AFTER all static routes
# that start with /interviews/...
#
# =========================================================

@router.get(
    "/{interview_id}"
)
async def get_interview(
    interview_id: str
):

    return await InterviewService.get_interview(
        interview_id
    )


# =========================================================
# SCHEDULE INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.patch(
    "/{interview_id}/schedule"
)
async def schedule_interview(
    interview_id: str,
    data: InterviewReschedule
):

    return await InterviewService.reschedule_interview(

        interview_id=interview_id,

        scheduled_date=
            data.scheduled_date,

        scheduled_time=
            data.scheduled_time,

        meeting_link=
            data.meeting_link,

        reason=
            data.reason
    )


# =========================================================
# CONFIRM INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.patch(
    "/{interview_id}/confirm"
)
async def confirm_interview(
    interview_id: str
):

    return await InterviewService.update_status(

        interview_id=interview_id,

        new_status="Confirmed"
    )


# =========================================================
# START INTERVIEW
# STUDENT SIDE
# =========================================================

@router.post(
    "/{interview_id}/start"
)
async def start_interview(
    interview_id: str,
    student_id: str
):

    # -------------------------------------------------
    # VALIDATE STUDENT ID
    # -------------------------------------------------

    if not student_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Student ID is required. "
                "Please login again."
            )
        )

    student_id = str(
        student_id
    ).strip()

    if not student_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Student ID is required. "
                "Please login again."
            )
        )

    # -------------------------------------------------
    # START INTERVIEW
    # -------------------------------------------------

    return await InterviewService.start_interview(

        interview_id=
            interview_id,

        student_id=
            student_id
    )


# =========================================================
# SAVE / UPDATE ANSWERS
# STUDENT SIDE
# =========================================================

@router.put(
    "/{interview_id}/answers"
)
async def update_answers(
    interview_id: str,
    data: InterviewAnswerUpdate,
    student_id: str
):

    if not student_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Student ID is required. "
                "Please login again."
            )
        )

    answers = [

        answer.model_dump()

        for answer
        in data.answers
    ]

    return await InterviewService.save_answers(

        interview_id=
            interview_id,

        student_id=
            str(student_id).strip(),

        answers=
            answers
    )


# =========================================================
# SUBMIT INTERVIEW
# STUDENT SIDE
# =========================================================

@router.post(
    "/{interview_id}/submit"
)
async def submit_interview(
    interview_id: str,
    data: InterviewSubmit,
    student_id: str
):

    if not student_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Student ID is required. "
                "Please login again."
            )
        )

    answers = [

        answer.model_dump()

        for answer
        in data.answers
    ]

    return await InterviewService.submit_interview(

        interview_id=
            interview_id,

        student_id=
            str(student_id).strip(),

        answers=
            answers,

        # Service automatically falls back
        # to stored interview data.

        resume_analysis={},

        job={}
    )


# =========================================================
# COMPLETE INTERVIEW
# STUDENT SIDE
# =========================================================

@router.patch(
    "/{interview_id}/complete"
)
async def complete_interview(
    interview_id: str
):

    return await InterviewService.update_status(

        interview_id=
            interview_id,

        new_status=
            "Completed"
    )


# =========================================================
# UPDATE INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.put(
    "/{interview_id}"
)
async def update_interview(
    interview_id: str,
    data: InterviewUpdate
):

    return await InterviewService.update_interview(

        interview_id=
            interview_id,

        data=
            data
    )


# =========================================================
# UPDATE INTERVIEW STATUS
# =========================================================

@router.patch(
    "/{interview_id}/status"
)
async def update_interview_status(
    interview_id: str,
    data: InterviewStatusUpdate
):

    return await InterviewService.update_status(

        interview_id=
            interview_id,

        new_status=
            data.status
    )


# =========================================================
# RESCHEDULE INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.post(
    "/{interview_id}/reschedule"
)
async def reschedule_interview(
    interview_id: str,
    data: InterviewReschedule
):

    return await InterviewService.reschedule_interview(

        interview_id=
            interview_id,

        scheduled_date=
            data.scheduled_date,

        scheduled_time=
            data.scheduled_time,

        meeting_link=
            data.meeting_link,

        reason=
            data.reason
    )


# =========================================================
# CANCEL INTERVIEW
# ORGANIZATION SIDE
# =========================================================

@router.post(
    "/{interview_id}/cancel"
)
async def cancel_interview(
    interview_id: str,
    reason: Optional[str] = None
):

    return await InterviewService.cancel_interview(

        interview_id=
            interview_id,

        reason=
            reason
    )


# =========================================================
# =========================================================
# PROCTORING - LEVEL 1
# =========================================================
# =========================================================


# =========================================================
# RECORD PROCTORING EVENT
# =========================================================

@router.post(
    "/{interview_id}/proctoring/event"
)
async def record_proctoring_event(
    interview_id: str,
    data: ProctoringEventCreate
):

    return await ProctoringService.record_event(

        interview_id=
            interview_id,

        event_type=
            data.event_type,

        severity=
            data.severity,

        message=
            data.message,

        metadata=
            data.metadata
    )


# =========================================================
# =========================================================
# COMPUTER VISION - LEVEL 2
# =========================================================
# =========================================================


# =========================================================
# RECORD COMPUTER VISION EVENT
# =========================================================
#
# POST:
#
# /interviews/{interview_id}/proctoring/cv-event
#
# Supported:
#
# face_detected
# face_not_detected
# multiple_faces_detected
# camera_blocked
# face_detection_failed
# looking_away
# head_pose_warning
# phone_detected
# person_left_frame
# suspicious_movement
#
# =========================================================

@router.post(
    "/{interview_id}/proctoring/cv-event"
)
async def record_computer_vision_event(
    interview_id: str,
    data: ComputerVisionEventCreate
):

    return await ComputerVisionService.record_event(

        interview_id=
            interview_id,

        event_type=
            data.event_type,

        severity=
            data.severity,

        message=
            data.message,

        metadata=
            data.metadata
    )


# =========================================================
# GET SUPPORTED CV EVENTS FOR SPECIFIC INTERVIEW
# =========================================================
#
# GET:
#
# /interviews/{interview_id}/proctoring/cv-events
#
# =========================================================

@router.get(
    "/{interview_id}/proctoring/cv-events"
)
async def get_interview_supported_computer_vision_events(
    interview_id: str
):

    # -------------------------------------------------
    # Verify interview exists
    # -------------------------------------------------

    await ProctoringService._get_interview(
        interview_id
    )

    # -------------------------------------------------
    # Return supported events
    # -------------------------------------------------

    return (
        ComputerVisionService
        .get_supported_events()
    )


# =========================================================
# GET PROCTORING SUMMARY
# =========================================================

@router.get(
    "/{interview_id}/proctoring"
)
async def get_proctoring(
    interview_id: str
):

    return await ProctoringService.get_proctoring(
        interview_id
    )


# =========================================================
# GET PROCTORING EVENTS
# =========================================================

@router.get(
    "/{interview_id}/proctoring/events"
)
async def get_proctoring_events(
    interview_id: str
):

    return await ProctoringService.get_events(
        interview_id
    )


# =========================================================
# RESET PROCTORING
# =========================================================

@router.post(
    "/{interview_id}/proctoring/reset"
)
async def reset_proctoring(
    interview_id: str
):

    return await ProctoringService.reset_proctoring(
        interview_id
    )
from typing import Any, Dict, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.cv_engine import cv_engine
from app.services.computer_vision_service import (
    ComputerVisionService,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/cv",
    tags=["Computer Vision"]
)


# =========================================================
# HEALTH CHECK
# =========================================================

@router.get(
    "/health"
)
async def cv_health():

    return cv_engine.health()


# =========================================================
# GET SUPPORTED CV EVENTS
# =========================================================

@router.get(
    "/events"
)
async def get_supported_cv_events():

    return (
        ComputerVisionService
        .get_supported_events()
    )


# =========================================================
# PROCESS SINGLE FRAME
# =========================================================
#
# POST:
#
# /cv/process-frame
#
# Form-data:
#
# frame = webcam image
#
# =========================================================

@router.post(
    "/process-frame"
)
async def process_frame(
    frame: UploadFile = File(...)
):

    # -----------------------------------------------------
    # VALIDATE CONTENT TYPE
    # -----------------------------------------------------

    if not frame.content_type:

        raise HTTPException(
            status_code=400,
            detail="Frame content type is required."
        )

    allowed_types = {

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if frame.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported frame format. "
                "Use JPEG, PNG, or WEBP."
            )
        )

    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    image_bytes = await frame.read()

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded frame is empty."
        )

    # -----------------------------------------------------
    # PROCESS FRAME
    # -----------------------------------------------------

    try:

        result = cv_engine.process_image_bytes(
            image_bytes
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Computer vision processing failed."
            )
        ) from exc

    return {

        "success":
            True,

        "message":
            "Frame processed successfully.",

        "result":
            result
    }


# =========================================================
# PROCESS FRAME + RECORD EVENTS
# =========================================================
#
# This endpoint:
#
# 1. Receives webcam frame
# 2. Runs CVEngine
# 3. Detects:
#       - face
#       - multiple faces
#       - phone
#       - person
#       - movement
# 4. Converts detections into CV events
# 5. Stores events in MongoDB
#
# POST:
#
# /cv/interview/{interview_id}/process-frame
#
# Form-data:
#
# frame = webcam image
#
# =========================================================

@router.post(
    "/interview/{interview_id}/process-frame"
)
async def process_interview_frame(
    interview_id: str,
    frame: UploadFile = File(...)
):

    # -----------------------------------------------------
    # VALIDATE INTERVIEW ID
    # -----------------------------------------------------

    if not interview_id:

        raise HTTPException(
            status_code=400,
            detail="Interview ID is required."
        )

    # -----------------------------------------------------
    # VALIDATE FILE
    # -----------------------------------------------------

    if not frame.content_type:

        raise HTTPException(
            status_code=400,
            detail="Frame content type is required."
        )

    allowed_types = {

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if frame.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported frame format. "
                "Use JPEG, PNG, or WEBP."
            )
        )

    # -----------------------------------------------------
    # READ FRAME
    # -----------------------------------------------------

    image_bytes = await frame.read()

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded frame is empty."
        )

    # -----------------------------------------------------
    # PROCESS WITH CV ENGINE
    # -----------------------------------------------------

    try:

        result = cv_engine.process_image_bytes(
            image_bytes
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Computer vision processing failed."
            )
        ) from exc

    # -----------------------------------------------------
    # GET DETECTED EVENTS
    # -----------------------------------------------------

    detected_events = result.get(
        "events",
        []
    )

    if not isinstance(
        detected_events,
        list
    ):

        detected_events = []

    recorded_events = []

    # -----------------------------------------------------
    # RECORD EACH EVENT
    # -----------------------------------------------------

    for detection in detected_events:

        if not isinstance(
            detection,
            dict
        ):

            continue

        event_type = detection.get(
            "event_type"
        )

        if not event_type:

            continue

        severity = detection.get(
            "severity",
            "low"
        )

        message = detection.get(
            "message"
        )

        metadata = detection.get(
            "metadata",
            {}
        )

        if not isinstance(
            metadata,
            dict
        ):

            metadata = {}

        metadata = {

            **metadata,

            "source":
                "cv_engine",

            "frame_processed":
                True
        }

        try:

            recorded = (
                await ComputerVisionService.record_event(

                    interview_id=
                        interview_id,

                    event_type=
                        event_type,

                    severity=
                        severity,

                    message=
                        message,

                    metadata=
                        metadata
                )
            )

            recorded_events.append(
                recorded
            )

        except HTTPException:

            # -------------------------------------------------
            # Do not stop processing the complete frame
            # because one event failed.
            # -------------------------------------------------

            continue

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success":
            True,

        "message":
            "Interview frame processed successfully.",

        "interview_id":
            interview_id,

        "cv_result":
            result,

        "detected_events":
            detected_events,

        "recorded_events":
            recorded_events,

        "recorded_count":
            len(
                recorded_events
            )
    }


# =========================================================
# PROCESS FRAME WITHOUT RECORDING
# =========================================================
#
# Useful for frontend preview/testing.
#
# POST:
#
# /cv/interview/{interview_id}/analyze
#
# This does NOT save anything to MongoDB.
#
# =========================================================

@router.post(
    "/interview/{interview_id}/analyze"
)
async def analyze_interview_frame(
    interview_id: str,
    frame: UploadFile = File(...)
):

    if not interview_id:

        raise HTTPException(
            status_code=400,
            detail="Interview ID is required."
        )

    # -----------------------------------------------------
    # VALIDATE CONTENT TYPE
    # -----------------------------------------------------

    allowed_types = {

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if frame.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported frame format. "
                "Use JPEG, PNG, or WEBP."
            )
        )

    # -----------------------------------------------------
    # READ FRAME
    # -----------------------------------------------------

    image_bytes = await frame.read()

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded frame is empty."
        )

    # -----------------------------------------------------
    # PROCESS
    # -----------------------------------------------------

    try:

        result = cv_engine.process_image_bytes(
            image_bytes
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Computer vision analysis failed."
            )
        ) from exc

    return {

        "success":
            True,

        "interview_id":
            interview_id,

        "result":
            result
    }


# =========================================================
# RECORD CV EVENT MANUALLY
# =========================================================
#
# Useful when frontend already performs detection.
#
# POST:
#
# /cv/interview/{interview_id}/event
#
# JSON:
#
# {
#   "event_type": "phone_detected",
#   "severity": "high",
#   "message": "...",
#   "metadata": {}
# }
#
# =========================================================

@router.post(
    "/interview/{interview_id}/event"
)
async def record_cv_event(
    interview_id: str,
    event_type: str = Form(...),
    severity: Optional[str] = Form(None),
    message: Optional[str] = Form(None)
):

    if not interview_id:

        raise HTTPException(
            status_code=400,
            detail="Interview ID is required."
        )

    # -----------------------------------------------------
    # METADATA
    # -----------------------------------------------------

    metadata: Dict[str, Any] = {

        "source":
            "cv_routes",

        "manual_event":
            True
    }

    # -----------------------------------------------------
    # RECORD EVENT
    # -----------------------------------------------------

    return await ComputerVisionService.record_event(

        interview_id=
            interview_id,

        event_type=
            event_type,

        severity=
            severity,

        message=
            message,

        metadata=
            metadata
    )
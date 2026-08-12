from typing import Any, Dict, Optional

from fastapi import HTTPException, status

from app.services.proctoring_service import ProctoringService


class ComputerVisionService:
    """
    Computer Vision event processing service.

    This service does NOT process webcam frames directly.

    The frontend/browser performs real-time CV detection and
    sends only detection events to the backend.

    Supported events:

        face_detected
        face_not_detected
        multiple_faces_detected
        camera_blocked
        face_detection_failed

        looking_away
        head_pose_warning
        phone_detected
        person_left_frame
        suspicious_movement
    """

    # =====================================================
    # SUPPORTED EVENTS
    # =====================================================

    SUPPORTED_EVENTS = {

        # -------------------------------------------------
        # LEVEL 2A - FACE / CAMERA
        # -------------------------------------------------

        "face_detected": {
            "severity": "low",
            "message": "Candidate face detected."
        },

        "face_not_detected": {
            "severity": "medium",
            "message": "Candidate face was not detected."
        },

        "multiple_faces_detected": {
            "severity": "high",
            "message": "Multiple faces detected in the interview frame."
        },

        "camera_blocked": {
            "severity": "high",
            "message": "Camera appears to be blocked or unavailable."
        },

        "face_detection_failed": {
            "severity": "medium",
            "message": "Computer vision face detection failed."
        },

        # -------------------------------------------------
        # LEVEL 2B - BEHAVIOR
        # -------------------------------------------------

        "looking_away": {
            "severity": "medium",
            "message": "Candidate appears to be looking away from the screen."
        },

        "head_pose_warning": {
            "severity": "medium",
            "message": "Candidate head pose indicates suspicious orientation."
        },

        "phone_detected": {
            "severity": "high",
            "message": "Possible mobile phone detected in the interview frame."
        },

        "person_left_frame": {
            "severity": "high",
            "message": "Candidate appears to have left the camera frame."
        },

        "suspicious_movement": {
            "severity": "medium",
            "message": "Suspicious movement detected in the interview frame."
        },
    }

    # =====================================================
    # NORMALIZE EVENT
    # =====================================================

    @staticmethod
    def normalize_event(
        event_type: str
    ) -> str:

        event_type = str(
            event_type or ""
        ).strip().lower()

        aliases = {

            # Face
            "face": "face_detected",

            "face_present":
                "face_detected",

            "no_face":
                "face_not_detected",

            "face_missing":
                "face_not_detected",

            "multiple_faces":
                "multiple_faces_detected",

            "multiple_person":
                "multiple_faces_detected",

            # Camera
            "camera_unavailable":
                "camera_blocked",

            "camera_disabled":
                "camera_blocked",

            "camera_issue":
                "camera_blocked",

            # Detection
            "cv_failed":
                "face_detection_failed",

            "face_detection_error":
                "face_detection_failed",

            # Looking
            "look_away":
                "looking_away",

            "looking_away_detected":
                "looking_away",

            # Head pose
            "head_pose":
                "head_pose_warning",

            "head_pose_detected":
                "head_pose_warning",

            # Phone
            "mobile_detected":
                "phone_detected",

            "mobile_phone_detected":
                "phone_detected",

            "phone_detection":
                "phone_detected",

            # Person
            "person_missing":
                "person_left_frame",

            "candidate_left":
                "person_left_frame",

            # Movement
            "suspicious_motion":
                "suspicious_movement",

            "movement_warning":
                "suspicious_movement",
        }

        return aliases.get(
            event_type,
            event_type
        )

    # =====================================================
    # VALIDATE EVENT
    # =====================================================

    @classmethod
    def validate_event(
        cls,
        event_type: str
    ) -> str:

        normalized_event = (
            cls.normalize_event(
                event_type
            )
        )

        if normalized_event not in cls.SUPPORTED_EVENTS:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Unsupported computer vision event.",
                    "event_type": event_type,
                    "supported_events": list(
                        cls.SUPPORTED_EVENTS.keys()
                    )
                }
            )

        return normalized_event

    # =====================================================
    # RECORD CV EVENT
    # =====================================================

    @classmethod
    async def record_event(
        cls,
        interview_id: str,
        event_type: str,
        severity: Optional[str] = None,
        message: Optional[str] = None,
        metadata: Optional[
            Dict[str, Any]
        ] = None
    ) -> Dict[str, Any]:

        # -------------------------------------------------
        # VALIDATE
        # -------------------------------------------------

        normalized_event = (
            cls.validate_event(
                event_type
            )
        )

        event_config = (
            cls.SUPPORTED_EVENTS[
                normalized_event
            ]
        )

        # -------------------------------------------------
        # USE DEFAULT SEVERITY
        # -------------------------------------------------

        final_severity = (
            severity
            if severity
            else event_config["severity"]
        )

        final_message = (
            message
            if message
            else event_config["message"]
        )

        # -------------------------------------------------
        # NORMALIZE METADATA
        # -------------------------------------------------

        if not isinstance(
            metadata,
            dict
        ):

            metadata = {}

        metadata = {

            **metadata,

            "source":
                "computer_vision",

            "cv_event":
                True,

        }

        # -------------------------------------------------
        # SEND TO EXISTING PROCTORING SERVICE
        # -------------------------------------------------

        result = await ProctoringService.record_event(

            interview_id=
                interview_id,

            event_type=
                normalized_event,

            severity=
                final_severity,

            message=
                final_message,

            metadata=
                metadata
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success":
                True,

            "message":
                "Computer vision event recorded.",

            "interview_id":
                interview_id,

            "event_type":
                normalized_event,

            "severity":
                final_severity,

            "event":
                result.get(
                    "event"
                ),

            "proctoring":
                result.get(
                    "proctoring"
                )
        }

    # =====================================================
    # GET SUPPORTED EVENTS
    # =====================================================

    @classmethod
    def get_supported_events(
        cls
    ) -> Dict[str, Any]:

        return {

            "success":
                True,

            "count":
                len(
                    cls.SUPPORTED_EVENTS
                ),

            "events":
                [
                    {
                        "event_type":
                            event_type,

                        "default_severity":
                            config["severity"],

                        "message":
                            config["message"]
                    }

                    for event_type, config
                    in cls.SUPPORTED_EVENTS.items()
                ]
        }
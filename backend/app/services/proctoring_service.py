from datetime import datetime
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import db


# =========================================================
# COLLECTION
# =========================================================

interview_collection = db["interviews"]


class ProctoringService:
    """
    Recruit_Ai Interview Proctoring Service.

    Handles:

    LEVEL 1
    - Tab switching
    - Fullscreen exit
    - Window blur
    - Copy / Paste
    - Right click
    - Developer tools
    - Keyboard shortcuts
    - Camera
    - Microphone

    LEVEL 2 - COMPUTER VISION
    - Face detected
    - Face not detected
    - Multiple faces detected
    - Camera blocked
    - Face detection failed
    - Looking away
    - Head pose warning
    - Phone detected
    - Person left frame
    - Suspicious movement

    IMPORTANT:
    This project currently uses synchronous PyMongo.

    Therefore:

        find_one()
        update_one()

    are intentionally NOT awaited.
    """

    # =====================================================
    # OBJECT ID
    # =====================================================

    @staticmethod
    def _object_id(
        interview_id: str
    ) -> ObjectId:

        try:

            return ObjectId(
                str(interview_id)
            )

        except Exception:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview ID."
            )

    # =====================================================
    # GET INTERVIEW
    # =====================================================

    @staticmethod
    async def _get_interview(
        interview_id: str
    ) -> Dict[str, Any]:

        object_id = (
            ProctoringService._object_id(
                interview_id
            )
        )

        # -------------------------------------------------
        # SYNCHRONOUS PYTHON MONGO
        # -------------------------------------------------

        interview = interview_collection.find_one(
            {
                "_id": object_id
            }
        )

        if not interview:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found."
            )

        return interview

    # =====================================================
    # DEFAULT PROCTORING
    # =====================================================

    @staticmethod
    def _default_proctoring(
        enabled: bool = True
    ) -> Dict[str, Any]:

        return {

            # -------------------------------------------------
            # BASIC
            # -------------------------------------------------

            "enabled":
                enabled,

            "warnings":
                0,

            "suspicious_events":
                0,

            # -------------------------------------------------
            # BROWSER MONITORING
            # -------------------------------------------------

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

            # -------------------------------------------------
            # CAMERA / MICROPHONE
            # -------------------------------------------------

            "camera_warnings":
                0,

            "microphone_warnings":
                0,

            # -------------------------------------------------
            # LEVEL 2 COMPUTER VISION
            # -------------------------------------------------

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

            # -------------------------------------------------
            # STATUS
            # -------------------------------------------------

            "overall_status":
                "Normal",

            # -------------------------------------------------
            # EVENTS
            # -------------------------------------------------

            "events":
                []
        }

    # =====================================================
    # EVENT SEVERITY
    # =====================================================

    @staticmethod
    def _severity_level(
        severity: str
    ) -> int:

        levels = {

            "low":
                1,

            "medium":
                2,

            "high":
                3,

            "critical":
                4
        }

        return levels.get(
            str(
                severity
            ).lower().strip(),
            1
        )

    # =====================================================
    # CALCULATE OVERALL STATUS
    # =====================================================

    @staticmethod
    def _calculate_status(
        proctoring: Dict[str, Any]
    ) -> str:

        suspicious_events = int(
            proctoring.get(
                "suspicious_events",
                0
            )
        )

        warnings = int(
            proctoring.get(
                "warnings",
                0
            )
        )

        # -------------------------------------------------
        # NORMAL
        # -------------------------------------------------

        if (
            suspicious_events == 0
            and warnings == 0
        ):

            return "Normal"

        # -------------------------------------------------
        # REVIEW
        # -------------------------------------------------

        if suspicious_events <= 2:

            return "Review"

        # -------------------------------------------------
        # SUSPICIOUS
        # -------------------------------------------------

        if suspicious_events <= 5:

            return "Suspicious"

        # -------------------------------------------------
        # HIGH RISK
        # -------------------------------------------------

        return "High Risk"

    # =====================================================
    # UPDATE EVENT COUNTERS
    # =====================================================

    @staticmethod
    def _update_counter(
        proctoring: Dict[str, Any],
        event_type: str
    ) -> None:

        event_type = str(
            event_type
        ).lower().strip()

        # =================================================
        # TAB SWITCH
        # =================================================

        if event_type in [

            "tab_switch",
            "tab_switch_detected",
            "visibility_change",
            "tab_changed"

        ]:

            proctoring[
                "tab_switches"
            ] = int(
                proctoring.get(
                    "tab_switches",
                    0
                )
            ) + 1

        # =================================================
        # FULLSCREEN
        # =================================================

        elif event_type in [

            "fullscreen_exit",
            "fullscreen_exited",
            "fullscreen_change",
            "left_fullscreen"

        ]:

            proctoring[
                "fullscreen_exits"
            ] = int(
                proctoring.get(
                    "fullscreen_exits",
                    0
                )
            ) + 1

        # =================================================
        # MULTIPLE PERSON / MULTIPLE FACE
        # =================================================

        elif event_type in [

            "multiple_person",
            "multiple_person_detected",
            "multiple_faces",
            "multiple_faces_detected"

        ]:

            proctoring[
                "multiple_faces_detected"
            ] = int(
                proctoring.get(
                    "multiple_faces_detected",
                    0
                )
            ) + 1

        # =================================================
        # FACE DETECTED
        # =================================================

        elif event_type in [

            "face_detected",
            "face_present",
            "face_found"

        ]:

            proctoring[
                "face_detected"
            ] = int(
                proctoring.get(
                    "face_detected",
                    0
                )
            ) + 1

        # =================================================
        # FACE NOT DETECTED
        # =================================================

        elif event_type in [

            "face_not_detected",
            "face_missing",
            "no_face"

        ]:

            proctoring[
                "face_not_detected"
            ] = int(
                proctoring.get(
                    "face_not_detected",
                    0
                )
            ) + 1

        # =================================================
        # FACE DETECTION FAILED
        # =================================================

        elif event_type in [

            "face_detection_failed",
            "face_detection_failure",
            "face_recognition_failed"

        ]:

            proctoring[
                "face_detection_failed"
            ] = int(
                proctoring.get(
                    "face_detection_failed",
                    0
                )
            ) + 1

        # =================================================
        # CAMERA BLOCKED
        # =================================================

        elif event_type in [

            "camera_blocked",
            "camera_block",
            "camera_obstructed"

        ]:

            proctoring[
                "camera_blocked"
            ] = int(
                proctoring.get(
                    "camera_blocked",
                    0
                )
            ) + 1

        # =================================================
        # CAMERA WARNING
        # =================================================

        elif event_type in [

            "camera_warning",
            "camera_issue",
            "camera_disabled",
            "camera_not_available"

        ]:

            proctoring[
                "camera_warnings"
            ] = int(
                proctoring.get(
                    "camera_warnings",
                    0
                )
            ) + 1

        # =================================================
        # MICROPHONE
        # =================================================

        elif event_type in [

            "microphone_warning",
            "microphone_issue",
            "microphone_disabled",
            "microphone_not_available",
            "mic_disabled"

        ]:

            proctoring[
                "microphone_warnings"
            ] = int(
                proctoring.get(
                    "microphone_warnings",
                    0
                )
            ) + 1

        # =================================================
        # LOOKING AWAY
        # =================================================

        elif event_type in [

            "looking_away",
            "looking_away_detected",
            "gaze_warning",
            "gaze_away"

        ]:

            proctoring[
                "looking_away"
            ] = int(
                proctoring.get(
                    "looking_away",
                    0
                )
            ) + 1

        # =================================================
        # HEAD POSE
        # =================================================

        elif event_type in [

            "head_pose_warning",
            "head_pose",
            "head_pose_detected",
            "abnormal_head_pose"

        ]:

            proctoring[
                "head_pose_warnings"
            ] = int(
                proctoring.get(
                    "head_pose_warnings",
                    0
                )
            ) + 1

        # =================================================
        # PHONE DETECTED
        # =================================================

        elif event_type in [

            "phone_detected",
            "mobile_detected",
            "cellphone_detected"

        ]:

            proctoring[
                "phone_detected"
            ] = int(
                proctoring.get(
                    "phone_detected",
                    0
                )
            ) + 1

        # =================================================
        # PERSON LEFT FRAME
        # =================================================

        elif event_type in [

            "person_left_frame",
            "person_out_of_frame",
            "candidate_left_frame",
            "candidate_not_in_frame"

        ]:

            proctoring[
                "person_left_frame"
            ] = int(
                proctoring.get(
                    "person_left_frame",
                    0
                )
            ) + 1

        # =================================================
        # SUSPICIOUS MOVEMENT
        # =================================================

        elif event_type in [

            "suspicious_movement",
            "suspicious_movement_detected",
            "abnormal_movement",
            "excessive_movement"

        ]:

            proctoring[
                "suspicious_movement"
            ] = int(
                proctoring.get(
                    "suspicious_movement",
                    0
                )
            ) + 1

        # =================================================
        # COPY / PASTE
        # =================================================

        elif event_type in [

            "copy",
            "paste",
            "copy_paste",
            "copy_paste_detected"

        ]:

            proctoring[
                "copy_paste_events"
            ] = int(
                proctoring.get(
                    "copy_paste_events",
                    0
                )
            ) + 1

        # =================================================
        # RIGHT CLICK
        # =================================================

        elif event_type in [

            "right_click",
            "context_menu",
            "contextmenu"

        ]:

            proctoring[
                "right_click_events"
            ] = int(
                proctoring.get(
                    "right_click_events",
                    0
                )
            ) + 1

        # =================================================
        # DEVELOPER TOOLS
        # =================================================

        elif event_type in [

            "developer_tools",
            "devtools",
            "devtools_detected",
            "developer_tools_detected"

        ]:

            proctoring[
                "developer_tools_events"
            ] = int(
                proctoring.get(
                    "developer_tools_events",
                    0
                )
            ) + 1

        # =================================================
        # KEYBOARD SHORTCUT
        # =================================================

        elif event_type in [

            "keyboard_shortcut",
            "suspicious_keyboard",
            "shortcut_detected",
            "suspicious_keyboard_shortcut"

        ]:

            proctoring[
                "keyboard_shortcut_events"
            ] = int(
                proctoring.get(
                    "keyboard_shortcut_events",
                    0
                )
            ) + 1

        # =================================================
        # WINDOW BLUR
        # =================================================

        elif event_type in [

            "window_blur",
            "window_hidden",
            "browser_blur"

        ]:

            proctoring[
                "window_blur_events"
            ] = int(
                proctoring.get(
                    "window_blur_events",
                    0
                )
            ) + 1

        # =================================================
        # GENERIC SUSPICIOUS ACTIVITY
        # =================================================

        elif event_type in [

            "suspicious_activity",
            "suspicious_behavior",
            "security_violation"

        ]:

            proctoring[
                "suspicious_activity_events"
            ] = int(
                proctoring.get(
                    "suspicious_activity_events",
                    0
                )
            ) + 1

    # =====================================================
    # RECORD PROCTORING EVENT
    # =====================================================

    @staticmethod
    async def record_event(
        interview_id: str,
        event_type: str,
        severity: str = "low",
        message: Optional[str] = None,
        metadata: Optional[
            Dict[str, Any]
        ] = None
    ) -> Dict[str, Any]:

        # =================================================
        # GET INTERVIEW
        # =================================================

        interview = (
            await ProctoringService._get_interview(
                interview_id
            )
        )

        # =================================================
        # CHECK PROCTORING
        # =================================================

        proctoring_enabled = interview.get(
            "proctoring_enabled",
            True
        )

        if not proctoring_enabled:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Proctoring is disabled "
                    "for this interview."
                )
            )

        # =================================================
        # STATUS CHECK
        # =================================================

        interview_status = str(
            interview.get(
                "status",
                ""
            )
        ).lower().strip()

        if interview_status in [

            "completed",
            "cancelled",
            "canceled"

        ]:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Cannot record proctoring "
                    "events for a finished interview."
                )
            )

        # =================================================
        # NORMALIZE EVENT
        # =================================================

        event_type = str(
            event_type
            or ""
        ).strip().lower()

        if not event_type:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event type is required."
            )

        # =================================================
        # ALLOWED EVENT TYPES
        # =================================================

        allowed_events = {

            # Browser
            "tab_switch",
            "tab_switch_detected",
            "visibility_change",
            "tab_changed",

            "fullscreen_exit",
            "fullscreen_exited",
            "fullscreen_change",
            "left_fullscreen",

            "window_blur",
            "window_hidden",
            "browser_blur",

            "copy",
            "paste",
            "copy_paste",
            "copy_paste_detected",

            "right_click",
            "context_menu",
            "contextmenu",

            "developer_tools",
            "devtools",
            "devtools_detected",
            "developer_tools_detected",

            "keyboard_shortcut",
            "suspicious_keyboard",
            "shortcut_detected",
            "suspicious_keyboard_shortcut",

            # Camera
            "camera_warning",
            "camera_issue",
            "camera_disabled",
            "camera_not_available",

            # Microphone
            "microphone_warning",
            "microphone_issue",
            "microphone_disabled",
            "microphone_not_available",
            "mic_disabled",

            # Computer Vision
            "face_detected",
            "face_present",
            "face_found",

            "face_not_detected",
            "face_missing",
            "no_face",

            "multiple_person",
            "multiple_person_detected",
            "multiple_faces",
            "multiple_faces_detected",

            "camera_blocked",
            "camera_block",
            "camera_obstructed",

            "face_detection_failed",
            "face_detection_failure",
            "face_recognition_failed",

            "looking_away",
            "looking_away_detected",
            "gaze_warning",
            "gaze_away",

            "head_pose_warning",
            "head_pose",
            "head_pose_detected",
            "abnormal_head_pose",

            "phone_detected",
            "mobile_detected",
            "cellphone_detected",

            "person_left_frame",
            "person_out_of_frame",
            "candidate_left_frame",
            "candidate_not_in_frame",

            "suspicious_movement",
            "suspicious_movement_detected",
            "abnormal_movement",
            "excessive_movement",

            # Generic
            "suspicious_activity",
            "suspicious_behavior",
            "security_violation"
        }

        if event_type not in allowed_events:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported proctoring event: "
                    f"{event_type}"
                )
            )

        # =================================================
        # NORMALIZE SEVERITY
        # =================================================

        severity = str(
            severity
            or "low"
        ).lower().strip()

        allowed_severities = [

            "low",
            "medium",
            "high",
            "critical"

        ]

        if severity not in allowed_severities:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid severity. "
                    f"Allowed values: "
                    f"{allowed_severities}"
                )
            )

        # =================================================
        # NORMALIZE METADATA
        # =================================================

        if not isinstance(
            metadata,
            dict
        ):

            metadata = {}

        # =================================================
        # CURRENT PROCTORING
        # =================================================

        proctoring = interview.get(
            "proctoring"
        )

        if not isinstance(
            proctoring,
            dict
        ):

            proctoring = (
                ProctoringService
                ._default_proctoring(
                    enabled=True
                )
            )

        # =================================================
        # ENSURE ALL COUNTERS EXIST
        # =================================================

        default_data = (
            ProctoringService
            ._default_proctoring(
                enabled=
                    proctoring.get(
                        "enabled",
                        True
                    )
            )
        )

        for key, value in default_data.items():

            if key not in proctoring:

                # Copy lists instead of sharing
                # references.

                if isinstance(value, list):

                    proctoring[key] = list(
                        value
                    )

                else:

                    proctoring[key] = value

        # =================================================
        # CREATE EVENT
        # =================================================

        event = {

            "event_type":
                event_type,

            "timestamp":
                datetime.utcnow(),

            "severity":
                severity,

            "message":
                message,

            "metadata":
                metadata
        }

        # =================================================
        # UPDATE EVENT COUNTER
        # =================================================

        ProctoringService._update_counter(
            proctoring,
            event_type
        )

        # =================================================
        # WARNINGS
        # =================================================

        if severity in [

            "medium",
            "high",
            "critical"

        ]:

            proctoring[
                "warnings"
            ] = int(
                proctoring.get(
                    "warnings",
                    0
                )
            ) + 1

        # =================================================
        # SUSPICIOUS EVENTS
        # =================================================

        if severity in [

            "high",
            "critical"

        ]:

            proctoring[
                "suspicious_events"
            ] = int(
                proctoring.get(
                    "suspicious_events",
                    0
                )
            ) + 1

        # =================================================
        # ADD EVENT
        # =================================================

        events = proctoring.get(
            "events",
            []
        )

        if not isinstance(
            events,
            list
        ):

            events = []

        events.append(
            event
        )

        # =================================================
        # KEEP ONLY LAST 500 EVENTS
        # =================================================

        if len(events) > 500:

            events = events[-500:]

        proctoring[
            "events"
        ] = events

        # =================================================
        # UPDATE OVERALL STATUS
        # =================================================

        proctoring[
            "overall_status"
        ] = (
            ProctoringService
            ._calculate_status(
                proctoring
            )
        )

        # =================================================
        # DATABASE UPDATE
        # =================================================

        object_id = (
            ProctoringService._object_id(
                interview_id
            )
        )

        interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "proctoring":
                        proctoring,

                    "updated_at":
                        datetime.utcnow()
                }
            }
        )

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success":
                True,

            "message":
                "Proctoring event recorded successfully.",

            "interview_id":
                interview_id,

            "event":
                event,

            "proctoring":
                proctoring
        }

    # =====================================================
    # GET PROCTORING SUMMARY
    # =====================================================

    @staticmethod
    async def get_proctoring(
        interview_id: str
    ) -> Dict[str, Any]:

        interview = (
            await ProctoringService._get_interview(
                interview_id
            )
        )

        proctoring = interview.get(
            "proctoring"
        )

        if not isinstance(
            proctoring,
            dict
        ):

            proctoring = (
                ProctoringService
                ._default_proctoring(
                    enabled=
                        interview.get(
                            "proctoring_enabled",
                            True
                        )
                )
            )

        return {

            "success":
                True,

            "interview_id":
                interview_id,

            "proctoring":
                proctoring
        }

    # =====================================================
    # GET PROCTORING EVENTS
    # =====================================================

    @staticmethod
    async def get_events(
        interview_id: str
    ) -> Dict[str, Any]:

        interview = (
            await ProctoringService._get_interview(
                interview_id
            )
        )

        proctoring = interview.get(
            "proctoring",
            {}
        )

        if not isinstance(
            proctoring,
            dict
        ):

            proctoring = (
                ProctoringService
                ._default_proctoring(
                    enabled=
                        interview.get(
                            "proctoring_enabled",
                            True
                        )
                )
            )

        events = proctoring.get(
            "events",
            []
        )

        if not isinstance(
            events,
            list
        ):

            events = []

        return {

            "success":
                True,

            "interview_id":
                interview_id,

            "count":
                len(events),

            "events":
                events
        }

    # =====================================================
    # RESET PROCTORING
    # =====================================================

    @staticmethod
    async def reset_proctoring(
        interview_id: str
    ) -> Dict[str, Any]:

        interview = (
            await ProctoringService._get_interview(
                interview_id
            )
        )

        interview_status = str(
            interview.get(
                "status",
                ""
            )
        ).lower().strip()

        # -------------------------------------------------
        # DO NOT RESET COMPLETED
        # -------------------------------------------------

        if interview_status == "completed":

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Completed interview "
                    "cannot reset proctoring."
                )
            )

        # -------------------------------------------------
        # DO NOT RESET CANCELLED
        # -------------------------------------------------

        if interview_status in [

            "cancelled",
            "canceled"

        ]:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Cancelled interview "
                    "cannot reset proctoring."
                )
            )

        # =================================================
        # RESET
        # =================================================

        proctoring_enabled = interview.get(
            "proctoring_enabled",
            True
        )

        proctoring = (
            ProctoringService
            ._default_proctoring(
                enabled=
                    proctoring_enabled
            )
        )

        # =================================================
        # DATABASE
        # =================================================

        object_id = (
            ProctoringService._object_id(
                interview_id
            )
        )

        interview_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "proctoring":
                        proctoring,

                    "updated_at":
                        datetime.utcnow()
                }
            }
        )

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success":
                True,

            "message":
                "Proctoring data reset successfully.",

            "interview_id":
                interview_id,

            "proctoring":
                proctoring
        }
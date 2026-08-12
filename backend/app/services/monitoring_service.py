from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.models.monitoring_model import monitoring_collection
from app.models.interview_model import interview_collection
from app.schemas.monitoring_schema import (
    MonitoringStart,
    FrameAnalysis,
    BrowserEvent,
    ViolationCreate
)


class MonitoringService:
    """Service class for managing interview monitoring operations."""

    # Integrity score deduction rules
    DEDUCTION_RULES = {
        "tab_switch": 5,
        "fullscreen_exit": 5,
        "copy": 10,
        "paste": 10,
        "cut": 10,
        "looking_away": 3,
        "face_missing": 15,
        "multiple_person": 30,
        "face_not_recognized": 40,
        "phone_detected": 25,
        "audio_detected": 15
    }

    @staticmethod
    def _convert_object_ids(document: Dict[str, Any]) -> Dict[str, Any]:
        """Convert all ObjectId fields to strings in a document."""
        if not document:
            return document

        converted = {}
        for key, value in document.items():
            if isinstance(value, ObjectId):
                converted[key] = str(value)
            elif isinstance(value, list):
                converted[key] = [
                    str(item) if isinstance(item, ObjectId) else item
                    for item in value
                ]
            elif isinstance(value, dict):
                converted[key] = MonitoringService._convert_object_ids(value)
            else:
                converted[key] = value
        return converted

    @staticmethod
    def _validate_object_id(id_string: str, field_name: str) -> ObjectId:
        """Validate and convert string to ObjectId."""
        try:
            return ObjectId(id_string)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {field_name} ID format."
            )

    @staticmethod
    def _get_document_or_404(
        collection,
        document_id: ObjectId,
        document_type: str
    ) -> Dict[str, Any]:
        """Fetch a document or raise 404 if not found."""
        document = collection.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{document_type} not found."
            )
        return document

    @staticmethod
    def _create_violation(
        violation_type: str,
        severity: str,
        message: str
    ) -> Dict[str, Any]:
        """
        Create a violation dictionary.

        Args:
            violation_type: Type of violation.
            severity: Severity level (low, medium, high, critical).
            message: Violation description.

        Returns:
            Violation dictionary.
        """
        return {
            "type": violation_type,
            "severity": severity,
            "message": message,
            "timestamp": datetime.utcnow()
        }

    @staticmethod
    def _calculate_integrity_score(monitoring_data: Dict[str, Any]) -> int:
        """
        Calculate integrity score based on monitoring data.

        Args:
            monitoring_data: Current monitoring document.

        Returns:
            Calculated integrity score (0-100).
        """
        score = 100

        # Deduct for various violations
        if monitoring_data.get("tab_switch_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["tab_switch"] * min(
                monitoring_data["tab_switch_count"], 5
            )

        if monitoring_data.get("fullscreen_exit_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["fullscreen_exit"] * min(
                monitoring_data["fullscreen_exit_count"], 5
            )

        if monitoring_data.get("copy_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["copy"] * min(
                monitoring_data["copy_count"], 3
            )

        if monitoring_data.get("paste_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["paste"] * min(
                monitoring_data["paste_count"], 3
            )

        if monitoring_data.get("cut_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["cut"] * min(
                monitoring_data["cut_count"], 3
            )

        if monitoring_data.get("looking_away_count", 0) > 0:
            score -= MonitoringService.DEDUCTION_RULES["looking_away"] * min(
                monitoring_data["looking_away_count"], 10
            )

        # Deduct for continuous violations
        if monitoring_data.get("multiple_person_detected", False):
            score -= MonitoringService.DEDUCTION_RULES["multiple_person"]

        if not monitoring_data.get("face_visible", True):
            score -= MonitoringService.DEDUCTION_RULES["face_missing"]

        if not monitoring_data.get("face_recognized", True):
            score -= MonitoringService.DEDUCTION_RULES["face_not_recognized"]

        if monitoring_data.get("mobile_detected", False):
            score -= MonitoringService.DEDUCTION_RULES["phone_detected"]

        if monitoring_data.get("audio_detected", False):
            score -= MonitoringService.DEDUCTION_RULES["audio_detected"]

        # Ensure score is between 0 and 100
        return max(0, min(100, score))

    @staticmethod
    def start_monitoring(data: MonitoringStart) -> Dict[str, Any]:
        """
        Start a new monitoring session for an interview.

        Args:
            data: Monitoring start data.

        Returns:
            Success message and monitoring ID.

        Raises:
            HTTPException: If interview not found or monitoring already exists.
        """
        # Validate interview ID
        interview_id = MonitoringService._validate_object_id(
            data.interview_id, "interview"
        )

        # Check if interview exists
        interview = MonitoringService._get_document_or_404(
            interview_collection, interview_id, "Interview"
        )

        # Check if monitoring already exists for this interview
        existing_monitoring = monitoring_collection.find_one(
            {"interview_id": interview_id, "session_status": "Running"}
        )
        if existing_monitoring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring session already exists for this interview."
            )

        current_time = datetime.utcnow()
        monitoring_document = {
            "interview_id": interview_id,
            "student_id": interview.get("student_id"),
            "organization_id": interview.get("organization_id"),
            "job_id": interview.get("job_id"),
            "session_status": "Running",
            "face_detected": False,
            "face_recognized": True,
            "multiple_person_detected": False,
            "person_count": 0,
            "face_visible": True,
            "looking_away_count": 0,
            "tab_switch_count": 0,
            "fullscreen_exit_count": 0,
            "copy_count": 0,
            "paste_count": 0,
            "cut_count": 0,
            "window_blur_count": 0,
            "mobile_detected": False,
            "audio_detected": False,
            "integrity_score": 100,
            "violations": [],
            "created_at": current_time,
            "updated_at": current_time
        }

        try:
            result = monitoring_collection.insert_one(monitoring_document)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to start monitoring: {str(e)}"
            )

        return {
            "success": True,
            "message": "Monitoring session started successfully.",
            "monitoring_id": str(result.inserted_id)
        }

    @staticmethod
    def get_monitoring(monitoring_id: str) -> Dict[str, Any]:
        """
        Get a monitoring session by ID.

        Args:
            monitoring_id: The monitoring ID.

        Returns:
            Monitoring document with ObjectIds converted to strings.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        return MonitoringService._convert_object_ids(monitoring)

    @staticmethod
    def get_all_monitoring() -> List[Dict[str, Any]]:
        """
        Get all monitoring sessions.

        Returns:
            List of monitoring documents with ObjectIds converted to strings.
        """
        monitoring_sessions = []
        try:
            for monitoring in monitoring_collection.find():
                monitoring_sessions.append(
                    MonitoringService._convert_object_ids(monitoring)
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve monitoring sessions: {str(e)}"
            )

        return monitoring_sessions

    @staticmethod
    def process_frame(analysis: FrameAnalysis) -> Dict[str, Any]:
        """
        Process a frame analysis and update monitoring data.

        Args:
            analysis: Frame analysis data.

        Returns:
            Current monitoring status.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_id = MonitoringService._validate_object_id(
            analysis.monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_id, "Monitoring"
        )

        if monitoring.get("session_status") != "Running":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring session is not running."
            )

        update_data = {
            "face_detected": analysis.face_detected,
            "face_recognized": analysis.face_recognized,
            "multiple_person_detected": analysis.multiple_person_detected,
            "person_count": analysis.person_count,
            "face_visible": analysis.face_visible,
            "mobile_detected": analysis.mobile_detected,
            "audio_detected": analysis.audio_detected,
            "updated_at": datetime.utcnow()
        }

        violations = monitoring.get("violations", [])
        looking_away_count = monitoring.get("looking_away_count", 0)

        # Check for looking away
        if analysis.looking_away:
            looking_away_count += 1
            update_data["looking_away_count"] = looking_away_count
            violations.append(
                MonitoringService._create_violation(
                    "looking_away",
                    "low",
                    f"Candidate looked away from screen (count: {looking_away_count})"
                )
            )

        # Check for multiple persons
        if analysis.multiple_person_detected and analysis.person_count > 1:
            violations.append(
                MonitoringService._create_violation(
                    "multiple_person",
                    "critical",
                    f"Multiple persons detected in frame (count: {analysis.person_count})"
                )
            )

        # Check for face missing
        if not analysis.face_visible and analysis.face_detected:
            violations.append(
                MonitoringService._create_violation(
                    "face_missing",
                    "high",
                    "Face not visible in frame"
                )
            )

        # Check for phone detection
        if analysis.mobile_detected:
            violations.append(
                MonitoringService._create_violation(
                    "phone_detected",
                    "high",
                    "Mobile phone detected in frame"
                )
            )

        # Check for face not recognized
        if not analysis.face_recognized and analysis.face_detected:
            violations.append(
                MonitoringService._create_violation(
                    "face_not_recognized",
                    "critical",
                    "Face detected but not recognized"
                )
            )

        update_data["violations"] = violations

        # Calculate integrity score
        monitoring.update(update_data)
        integrity_score = MonitoringService._calculate_integrity_score(monitoring)
        update_data["integrity_score"] = integrity_score

        try:
            monitoring_collection.update_one(
                {"_id": monitoring_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process frame: {str(e)}"
            )

        # Return current monitoring status
        return MonitoringService._convert_object_ids(
            monitoring_collection.find_one({"_id": monitoring_id})
        )

    @staticmethod
    def record_browser_event(monitoring_id: str, event: BrowserEvent) -> Dict[str, Any]:
        """
        Record a browser event and update monitoring data.

        Args:
            monitoring_id: The monitoring ID.
            event: Browser event data.

        Returns:
            Updated monitoring document.

        Raises:
            HTTPException: If monitoring not found or event type invalid.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        if monitoring.get("session_status") != "Running":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring session is not running."
            )

        # Map event types to counters
        event_mapping = {
            "tab_switch": "tab_switch_count",
            "fullscreen_exit": "fullscreen_exit_count",
            "copy": "copy_count",
            "paste": "paste_count",
            "cut": "cut_count",
            "window_blur": "window_blur_count"
        }

        # Validate event type
        if event.event_type not in event_mapping:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event type: {event.event_type}"
            )

        # Update counter
        counter_field = event_mapping[event.event_type]
        current_count = monitoring.get(counter_field, 0) + 1

        update_data = {
            counter_field: current_count,
            "updated_at": datetime.utcnow()
        }

        # Create violation
        severity_map = {
            "tab_switch": "medium",
            "fullscreen_exit": "medium",
            "copy": "high",
            "paste": "high",
            "cut": "high",
            "window_blur": "low"
        }

        violations = monitoring.get("violations", [])
        violations.append(
            MonitoringService._create_violation(
                event.event_type,
                severity_map.get(event.event_type, "medium"),
                f"{event.event_type.replace('_', ' ').title()} detected (count: {current_count})"
            )
        )
        update_data["violations"] = violations

        # Calculate integrity score
        monitoring.update(update_data)
        integrity_score = MonitoringService._calculate_integrity_score(monitoring)
        update_data["integrity_score"] = integrity_score

        try:
            monitoring_collection.update_one(
                {"_id": monitoring_object_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to record browser event: {str(e)}"
            )

        return MonitoringService._convert_object_ids(
            monitoring_collection.find_one({"_id": monitoring_object_id})
        )

    @staticmethod
    def add_violation(monitoring_id: str, violation: ViolationCreate) -> Dict[str, Any]:
        """
        Add a custom violation to the monitoring session.

        Args:
            monitoring_id: The monitoring ID.
            violation: Violation data.

        Returns:
            Updated monitoring document.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        if monitoring.get("session_status") != "Running":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring session is not running."
            )

        new_violation = MonitoringService._create_violation(
            violation.type,
            violation.severity,
            violation.message
        )

        violations = monitoring.get("violations", [])
        violations.append(new_violation)

        update_data = {
            "violations": violations,
            "updated_at": datetime.utcnow()
        }

        # Recalculate integrity score
        monitoring.update(update_data)
        integrity_score = MonitoringService._calculate_integrity_score(monitoring)
        update_data["integrity_score"] = integrity_score

        try:
            monitoring_collection.update_one(
                {"_id": monitoring_object_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to add violation: {str(e)}"
            )

        return MonitoringService._convert_object_ids(
            monitoring_collection.find_one({"_id": monitoring_object_id})
        )

    @staticmethod
    def calculate_integrity_score(monitoring_id: str) -> Dict[str, Any]:
        """
        Calculate and update the integrity score for a monitoring session.

        Args:
            monitoring_id: The monitoring ID.

        Returns:
            Updated monitoring document with new score.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        integrity_score = MonitoringService._calculate_integrity_score(monitoring)

        update_data = {
            "integrity_score": integrity_score,
            "updated_at": datetime.utcnow()
        }

        try:
            monitoring_collection.update_one(
                {"_id": monitoring_object_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to calculate integrity score: {str(e)}"
            )

        return MonitoringService._convert_object_ids(
            monitoring_collection.find_one({"_id": monitoring_object_id})
        )

    @staticmethod
    def end_monitoring(monitoring_id: str) -> Dict[str, Any]:
        """
        End a monitoring session and generate a final report.

        Args:
            monitoring_id: The monitoring ID.

        Returns:
            Final report with integrity score, violations, and statistics.

        Raises:
            HTTPException: If monitoring not found or already completed.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        if monitoring.get("session_status") == "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring session already completed."
            )

        current_time = datetime.utcnow()
        update_data = {
            "session_status": "Completed",
            "updated_at": current_time
        }

        # Calculate final integrity score
        integrity_score = MonitoringService._calculate_integrity_score(monitoring)
        update_data["integrity_score"] = integrity_score

        try:
            monitoring_collection.update_one(
                {"_id": monitoring_object_id},
                {"$set": update_data}
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to end monitoring: {str(e)}"
            )

        # Generate final report
        monitoring = monitoring_collection.find_one({"_id": monitoring_object_id})
        final_report = {
            "monitoring_id": str(monitoring["_id"]),
            "interview_id": str(monitoring["interview_id"]),
            "student_id": str(monitoring["student_id"]),
            "organization_id": str(monitoring["organization_id"]),
            "job_id": str(monitoring["job_id"]),
            "integrity_score": monitoring["integrity_score"],
            "violations": monitoring.get("violations", []),
            "statistics": {
                "looking_away_count": monitoring.get("looking_away_count", 0),
                "tab_switch_count": monitoring.get("tab_switch_count", 0),
                "fullscreen_exit_count": monitoring.get("fullscreen_exit_count", 0),
                "copy_count": monitoring.get("copy_count", 0),
                "paste_count": monitoring.get("paste_count", 0),
                "cut_count": monitoring.get("cut_count", 0),
                "window_blur_count": monitoring.get("window_blur_count", 0),
                "total_violations": len(monitoring.get("violations", []))
            },
            "session_duration": {
                "started_at": monitoring["created_at"],
                "ended_at": current_time
            }
        }

        return {
            "success": True,
            "message": "Monitoring session ended successfully.",
            "report": final_report
        }

    @staticmethod
    def delete_monitoring(monitoring_id: str) -> Dict[str, Any]:
        """
        Delete a monitoring session.

        Args:
            monitoring_id: The monitoring ID.

        Returns:
            Success message.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        # Verify monitoring exists
        MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        try:
            monitoring_collection.delete_one({"_id": monitoring_object_id})
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete monitoring: {str(e)}"
            )

        return {
            "success": True,
            "message": "Monitoring session deleted successfully."
        }

    @staticmethod
    def get_monitoring_by_interview(interview_id: str) -> List[Dict[str, Any]]:
        """
        Get all monitoring sessions for a specific interview.

        Args:
            interview_id: The interview ID.

        Returns:
            List of monitoring documents.

        Raises:
            HTTPException: If interview ID is invalid.
        """
        interview_object_id = MonitoringService._validate_object_id(
            interview_id, "interview"
        )

        monitoring_sessions = []
        try:
            for monitoring in monitoring_collection.find(
                {"interview_id": interview_object_id}
            ):
                monitoring_sessions.append(
                    MonitoringService._convert_object_ids(monitoring)
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve monitoring sessions: {str(e)}"
            )

        return monitoring_sessions

    @staticmethod
    def get_monitoring_by_student(student_id: str) -> List[Dict[str, Any]]:
        """
        Get all monitoring sessions for a specific student.

        Args:
            student_id: The student ID.

        Returns:
            List of monitoring documents.

        Raises:
            HTTPException: If student ID is invalid.
        """
        student_object_id = MonitoringService._validate_object_id(
            student_id, "student"
        )

        monitoring_sessions = []
        try:
            for monitoring in monitoring_collection.find(
                {"student_id": student_object_id}
            ):
                monitoring_sessions.append(
                    MonitoringService._convert_object_ids(monitoring)
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve monitoring sessions: {str(e)}"
            )

        return monitoring_sessions

    @staticmethod
    def get_monitoring_by_organization(organization_id: str) -> List[Dict[str, Any]]:
        """
        Get all monitoring sessions for a specific organization.

        Args:
            organization_id: The organization ID.

        Returns:
            List of monitoring documents.

        Raises:
            HTTPException: If organization ID is invalid.
        """
        organization_object_id = MonitoringService._validate_object_id(
            organization_id, "organization"
        )

        monitoring_sessions = []
        try:
            for monitoring in monitoring_collection.find(
                {"organization_id": organization_object_id}
            ):
                monitoring_sessions.append(
                    MonitoringService._convert_object_ids(monitoring)
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve monitoring sessions: {str(e)}"
            )

        return monitoring_sessions

    @staticmethod
    def get_active_monitoring_sessions() -> List[Dict[str, Any]]:
        """
        Get all active (running) monitoring sessions.

        Returns:
            List of active monitoring documents.
        """
        monitoring_sessions = []
        try:
            for monitoring in monitoring_collection.find(
                {"session_status": "Running"}
            ):
                monitoring_sessions.append(
                    MonitoringService._convert_object_ids(monitoring)
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve active monitoring sessions: {str(e)}"
            )

        return monitoring_sessions

    @staticmethod
    def get_monitoring_statistics(monitoring_id: str) -> Dict[str, Any]:
        """
        Get statistics for a monitoring session.

        Args:
            monitoring_id: The monitoring ID.

        Returns:
            Statistics summary.

        Raises:
            HTTPException: If monitoring not found.
        """
        monitoring_object_id = MonitoringService._validate_object_id(
            monitoring_id, "monitoring"
        )

        monitoring = MonitoringService._get_document_or_404(
            monitoring_collection, monitoring_object_id, "Monitoring"
        )

        violations = monitoring.get("violations", [])
        violation_types = {}
        for violation in violations:
            violation_type = violation.get("type", "unknown")
            violation_types[violation_type] = violation_types.get(violation_type, 0) + 1

        return {
            "monitoring_id": str(monitoring["_id"]),
            "session_status": monitoring.get("session_status"),
            "integrity_score": monitoring.get("integrity_score", 0),
            "violation_summary": {
                "total_violations": len(violations),
                "violation_types": violation_types
            },
            "counters": {
                "looking_away": monitoring.get("looking_away_count", 0),
                "tab_switch": monitoring.get("tab_switch_count", 0),
                "fullscreen_exit": monitoring.get("fullscreen_exit_count", 0),
                "copy": monitoring.get("copy_count", 0),
                "paste": monitoring.get("paste_count", 0),
                "cut": monitoring.get("cut_count", 0),
                "window_blur": monitoring.get("window_blur_count", 0)
            },
            "detections": {
                "face_detected": monitoring.get("face_detected", False),
                "face_recognized": monitoring.get("face_recognized", False),
                "face_visible": monitoring.get("face_visible", False),
                "multiple_person": monitoring.get("multiple_person_detected", False),
                "mobile_detected": monitoring.get("mobile_detected", False),
                "audio_detected": monitoring.get("audio_detected", False)
            }
        }
from fastapi import APIRouter

from app.schemas.monitoring_schema import (
    MonitoringStart,
    FrameAnalysis,
    BrowserEvent,
    ViolationCreate,
    MonitoringEnd
)

from app.services.monitoring_service import (
    MonitoringService
)

router = APIRouter(
    prefix="/monitoring",
    tags=["Interview Monitoring"]
)


# Start Monitoring
@router.post("/start")
def start_monitoring(data: MonitoringStart):
    return MonitoringService.start_monitoring(data)


# Get All Monitoring Sessions
@router.get("/")
def get_all_monitoring():
    return MonitoringService.get_all_monitoring()


# Get Monitoring Session
@router.get("/{monitoring_id}")
def get_monitoring(monitoring_id: str):
    return MonitoringService.get_monitoring(
        monitoring_id
    )


# Process Webcam Frame
@router.post("/frame")
def process_frame(data: FrameAnalysis):
    return MonitoringService.process_frame(data)


# Record Browser Event
@router.post("/event")
def record_browser_event(data: BrowserEvent):
    return MonitoringService.record_browser_event(
        data
    )


# Add Manual Violation
@router.post("/violation")
def add_violation(data: ViolationCreate):
    return MonitoringService.add_violation(
        data
    )


# End Monitoring Session
@router.post("/end")
def end_monitoring(data: MonitoringEnd):
    return MonitoringService.end_monitoring(data)


# Delete Monitoring Session
@router.delete("/{monitoring_id}")
def delete_monitoring(monitoring_id: str):
    return MonitoringService.delete_monitoring(
        monitoring_id
    )


# Get Monitoring By Interview
@router.get("/interview/{interview_id}")
def get_monitoring_by_interview(
    interview_id: str
):
    return MonitoringService.get_monitoring_by_interview(
        interview_id
    )


# Get Monitoring By Student
@router.get("/student/{student_id}")
def get_monitoring_by_student(
    student_id: str
):
    return MonitoringService.get_monitoring_by_student(
        student_id
    )


# Get Monitoring By Organization
@router.get("/organization/{organization_id}")
def get_monitoring_by_organization(
    organization_id: str
):
    return MonitoringService.get_monitoring_by_organization(
        organization_id
    )
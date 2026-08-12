from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# -----------------------------
# Start Monitoring
# -----------------------------
class MonitoringStart(BaseModel):

    interview_id: str

    student_id: str

    organization_id: str

    job_id: str


# -----------------------------
# Webcam Frame Analysis
# -----------------------------
class FrameAnalysis(BaseModel):

    interview_id: str

    face_detected: bool

    face_recognized: bool

    multiple_person_detected: bool

    person_count: int

    face_visible: bool

    looking_away: bool

    mobile_detected: bool

    audio_detected: bool


# -----------------------------
# Browser Events
# -----------------------------
class BrowserEvent(BaseModel):

    interview_id: str

    event_type: str
    # tab_switch
    # fullscreen_exit
    # window_blur
    # copy
    # paste
    # cut


# -----------------------------
# Violation
# -----------------------------
class ViolationCreate(BaseModel):

    interview_id: str

    violation_type: str

    severity: str

    message: str


# -----------------------------
# Finish Monitoring
# -----------------------------
class MonitoringEnd(BaseModel):

    interview_id: str


# -----------------------------
# Violation Response
# -----------------------------
class ViolationResponse(BaseModel):

    type: str

    severity: str

    message: str

    timestamp: datetime


# -----------------------------
# Monitoring Response
# -----------------------------
class MonitoringResponse(BaseModel):

    id: str

    interview_id: str

    student_id: str

    organization_id: str

    job_id: str

    session_status: str

    face_detected: bool

    face_recognized: bool

    multiple_person_detected: bool

    person_count: int

    face_visible: bool

    looking_away_count: int

    tab_switch_count: int

    fullscreen_exit_count: int

    copy_count: int

    paste_count: int

    cut_count: int

    window_blur_count: int

    mobile_detected: bool

    audio_detected: bool

    integrity_score: int

    violations: List[ViolationResponse]

    created_at: datetime

    updated_at: datetime
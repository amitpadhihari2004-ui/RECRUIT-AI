import api from "./axios";


// =========================================================
// HELPER - GET STUDENT ID
// =========================================================

const getStudentId = (studentId) => {

  const id =
    studentId ||
    localStorage.getItem("studentId") ||
    localStorage.getItem("student_id") ||
    localStorage.getItem("user_id");

  if (!id) {

    throw new Error(
      "Student ID not found. Please login again."
    );
  }

  return String(id);
};


// =========================================================
// CREATE INTERVIEW
// ORGANIZATION SIDE
// =========================================================

export const createInterview = async (
  data,
  resumeAnalysis = {},
  job = {}
) => {

  if (!data) {

    throw new Error(
      "Interview data is required."
    );
  }

  const response = await api.post(
    "/interviews/",
    {
      data: data,

      resume_analysis:
        resumeAnalysis || {},

      job:
        job || {},
    }
  );

  return response.data;
};


// =========================================================
// GET ALL INTERVIEWS
// =========================================================

export const getAllInterviews = async () => {

  const response = await api.get(
    "/interviews/"
  );

  return response.data;
};


// =========================================================
// GET INTERVIEW BY ID
// =========================================================

export const getInterview = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.get(
    `/interviews/${interviewId}`
  );

  return response.data;
};


// =========================================================
// GET INTERVIEW BY APPLICATION
// =========================================================

export const getApplicationInterview = async (
  applicationId
) => {

  if (!applicationId) {

    throw new Error(
      "Application ID is required."
    );
  }

  const response = await api.get(
    `/interviews/application/${applicationId}`
  );

  return response.data;
};


// =========================================================
// GET INTERVIEWS BY STUDENT
// =========================================================

export const getStudentInterviews = async (
  studentId
) => {

  const id = getStudentId(
    studentId
  );

  const response = await api.get(
    `/interviews/student/${id}`
  );

  return response.data;
};


// =========================================================
// GET INTERVIEWS BY ORGANIZATION
// =========================================================

export const getOrganizationInterviews = async (
  organizationId
) => {

  if (!organizationId) {

    throw new Error(
      "Organization ID is required."
    );
  }

  const response = await api.get(
    `/interviews/organization/${organizationId}`
  );

  return response.data;
};


// =========================================================
// GET UPCOMING INTERVIEWS
// ORGANIZATION SIDE
// =========================================================

export const getUpcomingInterviews = async (
  organizationId
) => {

  if (!organizationId) {

    throw new Error(
      "Organization ID is required."
    );
  }

  const response = await api.get(
    `/interviews/upcoming/organization/${organizationId}`
  );

  return response.data;
};


// =========================================================
// START INTERVIEW
// STUDENT SIDE
// =========================================================
//
// BACKEND:
//
// POST
// /interviews/{interview_id}/start?student_id=XXXX
//
// =========================================================

export const startInterview = async (
  interviewId,
  studentId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const id = getStudentId(
    studentId
  );

  console.log(
    "Starting interview:",
    interviewId
  );

  console.log(
    "Student ID:",
    id
  );

  const response = await api.post(

    `/interviews/${interviewId}/start`,

    null,

    {
      params: {
        student_id: id,
      },
    }

  );

  console.log(
    "Start Interview Response:",
    response.data
  );

  return response.data;
};


// =========================================================
// SAVE / UPDATE ANSWERS
// STUDENT SIDE
// =========================================================
//
// PUT
// /interviews/{interview_id}/answers?student_id=XXXX
//
// =========================================================

export const updateAnswers = async (
  interviewId,
  answers,
  studentId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const id = getStudentId(
    studentId
  );

  const response = await api.put(

    `/interviews/${interviewId}/answers`,

    {
      answers:
        Array.isArray(answers)
          ? answers
          : [],
    },

    {
      params: {
        student_id: id,
      },
    }

  );

  return response.data;
};


// =========================================================
// SUBMIT INTERVIEW
// STUDENT SIDE
// =========================================================
//
// POST
// /interviews/{interview_id}/submit?student_id=XXXX
//
// =========================================================

export const submitInterview = async (
  interviewId,
  answers,
  studentId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const id = getStudentId(
    studentId
  );

  const response = await api.post(

    `/interviews/${interviewId}/submit`,

    {
      answers:
        Array.isArray(answers)
          ? answers
          : [],
    },

    {
      params: {
        student_id: id,
      },
    }

  );

  console.log(
    "Submit Interview Response:",
    response.data
  );

  return response.data;
};


// =========================================================
// COMPLETE INTERVIEW
// STUDENT SIDE
// =========================================================

export const completeInterview = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.patch(
    `/interviews/${interviewId}/complete`
  );

  return response.data;
};


// =========================================================
// UPDATE INTERVIEW
// ORGANIZATION SIDE
// =========================================================

export const updateInterview = async (
  interviewId,
  data
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.put(
    `/interviews/${interviewId}`,
    data
  );

  return response.data;
};


// =========================================================
// UPDATE INTERVIEW STATUS
// =========================================================

export const updateInterviewStatus = async (
  interviewId,
  status
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  if (!status) {

    throw new Error(
      "Interview status is required."
    );
  }

  const response = await api.patch(

    `/interviews/${interviewId}/status`,

    {
      status: status,
    }

  );

  return response.data;
};


// =========================================================
// SCHEDULE INTERVIEW
// ORGANIZATION SIDE
// =========================================================
//
// PATCH
// /interviews/{interview_id}/schedule
//
// =========================================================

export const scheduleInterview = async (
  interviewId,
  data
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.patch(

    `/interviews/${interviewId}/schedule`,

    data

  );

  return response.data;
};


// =========================================================
// CONFIRM INTERVIEW
// ORGANIZATION SIDE
// =========================================================
//
// PATCH
// /interviews/{interview_id}/confirm
//
// =========================================================

export const confirmInterview = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.patch(
    `/interviews/${interviewId}/confirm`
  );

  return response.data;
};


// =========================================================
// RESCHEDULE INTERVIEW
// ORGANIZATION SIDE
// =========================================================
//
// POST
// /interviews/{interview_id}/reschedule
//
// =========================================================

export const rescheduleInterview = async (
  interviewId,
  data
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.post(

    `/interviews/${interviewId}/reschedule`,

    data

  );

  return response.data;
};


// =========================================================
// CANCEL INTERVIEW
// ORGANIZATION SIDE
// =========================================================

export const cancelInterview = async (
  interviewId,
  reason = null
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.post(

    `/interviews/${interviewId}/cancel`,

    null,

    {
      params: {
        reason: reason,
      },
    }

  );

  return response.data;
};


// =========================================================
// =========================================================
// PROCTORING - LEVEL 1
// =========================================================
// =========================================================


// =========================================================
// RECORD PROCTORING EVENT
// =========================================================
//
// POST
// /interviews/{interview_id}/proctoring/event
//
// Examples:
//
// tab_switch
// fullscreen_exit
// window_blur
// copy
// paste
// right_click
// developer_tools
// keyboard_shortcut
// camera_warning
// microphone_warning
//
// =========================================================

export const recordProctoringEvent = async (
  interviewId,
  event
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  if (!event?.event_type) {

    throw new Error(
      "Proctoring event type is required."
    );
  }

  const response = await api.post(

    `/interviews/${interviewId}/proctoring/event`,

    {
      event_type:
        event.event_type,

      severity:
        event.severity ||
        "low",

      message:
        event.message ||
        null,

      metadata:
        event.metadata ||
        {},
    }

  );

  return response.data;
};


// =========================================================
// GET PROCTORING SUMMARY
// =========================================================

export const getProctoring = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.get(
    `/interviews/${interviewId}/proctoring`
  );

  return response.data;
};


// =========================================================
// GET PROCTORING EVENTS
// =========================================================

export const getProctoringEvents = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.get(
    `/interviews/${interviewId}/proctoring/events`
  );

  return response.data;
};


// =========================================================
// RESET PROCTORING
// =========================================================

export const resetProctoring = async (
  interviewId
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  const response = await api.post(
    `/interviews/${interviewId}/proctoring/reset`
  );

  return response.data;
};


// =========================================================
// =========================================================
// COMPUTER VISION - LEVEL 2
// =========================================================
// =========================================================
//
// These functions communicate with:
//
// ComputerVisionService
//
// Supported CV events:
//
// face_detected
// face_not_detected
// multiple_faces_detected
// camera_blocked
// face_detection_failed
// looking_away
// head_pose_warning
// phone_detected
// person_left_frame
// suspicious_movement
//
// =========================================================


// =========================================================
// RECORD COMPUTER VISION EVENT
// =========================================================
//
// IMPORTANT:
//
// Severity is OPTIONAL.
//
// If severity is not provided,
// ComputerVisionService automatically uses:
//
// face_detected
//     -> low
//
// face_not_detected
//     -> medium
//
// multiple_faces_detected
//     -> high
//
// camera_blocked
//     -> high
//
// face_detection_failed
//     -> medium
//
// looking_away
//     -> medium
//
// head_pose_warning
//     -> medium
//
// phone_detected
//     -> high
//
// person_left_frame
//     -> high
//
// suspicious_movement
//     -> medium
//
// =========================================================

export const recordComputerVisionEvent = async (
  interviewId,
  event
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  if (!event?.event_type) {

    throw new Error(
      "Computer vision event type is required."
    );
  }

  const payload = {

    event_type:
      event.event_type,

    message:
      event.message ||
      null,

    metadata: {
      ...(event.metadata || {}),

      source:
        "computer_vision",

      cv_event:
        true,
    },
  };


  // -----------------------------------------------------
  // ONLY SEND SEVERITY IF PROVIDED
  // -----------------------------------------------------
  //
  // This allows backend ComputerVisionService
  // to automatically select the correct severity.
  //
  // -----------------------------------------------------

  if (event.severity) {

    payload.severity =
      event.severity;
  }


  const response = await api.post(

    `/interviews/${interviewId}/proctoring/cv-event`,

    payload

  );

  return response.data;
};


// =========================================================
// SIMPLE COMPUTER VISION EVENT HELPER
// =========================================================
//
// Example:
//
// recordCVEvent(
//   interviewId,
//   "phone_detected",
//   {
//     confidence: 0.92
//   }
// );
//
// =========================================================

export const recordCVEvent = async (
  interviewId,
  eventType,
  metadata = {},
  message = null,
  severity = null
) => {

  if (!interviewId) {

    throw new Error(
      "Interview ID is required."
    );
  }

  if (!eventType) {

    throw new Error(
      "Computer vision event type is required."
    );
  }

  return recordComputerVisionEvent(

    interviewId,

    {
      event_type:
        eventType,

      severity:
        severity,

      message:
        message,

      metadata:
        metadata,
    }

  );
};


// =========================================================
// GET SUPPORTED COMPUTER VISION EVENTS
// =========================================================
//
// This endpoint will be used by frontend if required
// to dynamically display supported CV events.
//
// =========================================================

export const getSupportedComputerVisionEvents =
  async () => {

    const response = await api.get(
      "/interviews/proctoring/cv-events/supported"
    );

    return response.data;
  };


// =========================================================
// CONVENIENCE HELPERS
// =========================================================


// =========================================================
// FACE DETECTED
// =========================================================

export const recordFaceDetected = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "face_detected",

    metadata

  );
};


// =========================================================
// FACE NOT DETECTED
// =========================================================

export const recordFaceNotDetected = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "face_not_detected",

    metadata

  );
};


// =========================================================
// MULTIPLE FACES
// =========================================================

export const recordMultipleFacesDetected =
  async (
    interviewId,
    metadata = {}
  ) => {

    return recordCVEvent(

      interviewId,

      "multiple_faces_detected",

      metadata

    );
  };


// =========================================================
// CAMERA BLOCKED
// =========================================================

export const recordCameraBlocked = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "camera_blocked",

    metadata

  );
};


// =========================================================
// FACE DETECTION FAILED
// =========================================================

export const recordFaceDetectionFailed =
  async (
    interviewId,
    metadata = {}
  ) => {

    return recordCVEvent(

      interviewId,

      "face_detection_failed",

      metadata

    );
  };


// =========================================================
// LOOKING AWAY
// =========================================================

export const recordLookingAway = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "looking_away",

    metadata

  );
};


// =========================================================
// HEAD POSE WARNING
// =========================================================

export const recordHeadPoseWarning = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "head_pose_warning",

    metadata

  );
};


// =========================================================
// PHONE DETECTED
// =========================================================

export const recordPhoneDetected = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "phone_detected",

    metadata

  );
};


// =========================================================
// PERSON LEFT FRAME
// =========================================================

export const recordPersonLeftFrame = async (
  interviewId,
  metadata = {}
) => {

  return recordCVEvent(

    interviewId,

    "person_left_frame",

    metadata

  );
};


// =========================================================
// SUSPICIOUS MOVEMENT
// =========================================================

export const recordSuspiciousMovement =
  async (
    interviewId,
    metadata = {}
  ) => {

    return recordCVEvent(

      interviewId,

      "suspicious_movement",

      metadata

    );
  };
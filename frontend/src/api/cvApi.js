import api from "./axios";

// =========================================================
// COMPUTER VISION API
// =========================================================
//
// Backend:
//
// GET
//   /cv/health
//   /cv/events
//
// POST
//   /cv/process-frame
//   /cv/interview/{interview_id}/process-frame
//   /cv/interview/{interview_id}/analyze
//   /cv/interview/{interview_id}/event
//
// =========================================================


// =========================================================
// VALIDATE INTERVIEW ID
// =========================================================

const validateInterviewId = (interviewId) => {
  if (
    interviewId === null ||
    interviewId === undefined ||
    String(interviewId).trim() === ""
  ) {
    throw new Error("Interview ID is required.");
  }

  return String(interviewId).trim();
};


// =========================================================
// VALIDATE FRAME
// =========================================================

const validateFrame = (frameBlob) => {
  if (!frameBlob) {
    throw new Error("Camera frame is required.");
  }

  if (!(frameBlob instanceof Blob)) {
    throw new Error("Invalid camera frame.");
  }

  if (frameBlob.size <= 0) {
    throw new Error("Camera frame is empty.");
  }

  return frameBlob;
};


// =========================================================
// CREATE FORM DATA
// =========================================================

const createFrameFormData = (frameBlob) => {
  const frame = validateFrame(frameBlob);

  const formData = new FormData();

  formData.append(
    "frame",
    frame,
    "webcam-frame.jpg"
  );

  return formData;
};


// =========================================================
// ERROR MESSAGE
// =========================================================

const getErrorMessage = (error) => {
  if (
    error?.response?.data?.detail
  ) {
    if (
      typeof error.response.data.detail === "string"
    ) {
      return error.response.data.detail;
    }

    try {
      return JSON.stringify(
        error.response.data.detail
      );
    } catch {
      return "Backend returned an error.";
    }
  }

  if (
    error?.response?.data?.message
  ) {
    return error.response.data.message;
  }

  return (
    error?.message ||
    "Computer vision request failed."
  );
};


// =========================================================
// CV HEALTH
// =========================================================

export const getCVHealth = async () => {
  try {
    const response = await api.get(
      "/cv/health"
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ CV Health Error:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
};


// =========================================================
// SUPPORTED EVENTS
// =========================================================

export const getSupportedCVEvents = async () => {
  try {
    const response = await api.get(
      "/cv/events"
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ Supported CV Events Error:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
};


// =========================================================
// PROCESS INTERVIEW FRAME
// =========================================================
//
// POST:
//
// /cv/interview/{interview_id}/process-frame
//
// This:
// - receives webcam frame
// - runs CV
// - detects events
// - records events
//
// =========================================================

export const processInterviewFrame = async (
  interviewId,
  frameBlob
) => {
  const id = validateInterviewId(
    interviewId
  );

  const formData =
    createFrameFormData(
      frameBlob
    );

  try {
    const response = await api.post(
      `/cv/interview/${encodeURIComponent(
        id
      )}/process-frame`,
      formData,
      {
        withCredentials: true,

        timeout: 30000
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ CV Frame Processing Error:",
      {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data
      }
    );

    throw error;
  }
};


// =========================================================
// ALIAS
// =========================================================

export const processCVFrame =
  processInterviewFrame;


// =========================================================
// ANALYZE FRAME
// =========================================================
//
// POST:
//
// /cv/interview/{interview_id}/analyze
//
// Does NOT save events.
//
// =========================================================

export const analyzeInterviewFrame = async (
  interviewId,
  frameBlob
) => {
  const id = validateInterviewId(
    interviewId
  );

  const formData =
    createFrameFormData(
      frameBlob
    );

  try {
    const response = await api.post(
      `/cv/interview/${encodeURIComponent(
        id
      )}/analyze`,
      formData,
      {
        withCredentials: true,

        timeout: 30000
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ CV Analysis Error:",
      {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data
      }
    );

    throw error;
  }
};


// =========================================================
// DIRECT CV PROCESS
// =========================================================
//
// POST:
//
// /cv/process-frame
//
// Useful for testing without interview ID.
//
// =========================================================

export const processFrame = async (
  frameBlob
) => {
  const formData =
    createFrameFormData(
      frameBlob
    );

  try {
    const response = await api.post(
      "/cv/process-frame",
      formData,
      {
        withCredentials: true,

        timeout: 30000
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ Direct CV Processing Error:",
      {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data
      }
    );

    throw error;
  }
};


// =========================================================
// RECORD CV EVENT
// =========================================================
//
// POST:
//
// /cv/interview/{interview_id}/event
//
// Backend expects:
//
// FormData
// event_type
// severity
// message
//
// =========================================================

export const recordCVEvent = async (
  interviewId,
  event = {}
) => {
  const id = validateInterviewId(
    interviewId
  );

  const eventType = String(
    event?.event_type || ""
  ).trim();

  if (!eventType) {
    throw new Error(
      "CV event type is required."
    );
  }

  const formData = new FormData();

  formData.append(
    "event_type",
    eventType
  );

  formData.append(
    "severity",
    event?.severity || "low"
  );

  formData.append(
    "message",
    event?.message || ""
  );

  try {
    const response = await api.post(
      `/cv/interview/${encodeURIComponent(
        id
      )}/event`,
      formData,
      {
        withCredentials: true,

        timeout: 15000
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ CV Event Error:",
      {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data
      }
    );

    throw error;
  }
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

const cvApi = {
  getCVHealth,
  getSupportedCVEvents,

  processFrame,

  processInterviewFrame,
  processCVFrame,

  analyzeInterviewFrame,

  recordCVEvent
};

export default cvApi;
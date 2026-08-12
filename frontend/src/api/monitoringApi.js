import api from "./axios";


// Start Monitoring
export const startMonitoring = async (data) => {
  const response = await api.post(
    "/monitoring/start",
    data
  );

  return response.data;
};


// Process Webcam Frame
export const processFrame = async (data) => {
  const response = await api.post(
    "/monitoring/frame",
    data
  );

  return response.data;
};


// Record Browser Event
export const recordBrowserEvent = async (data) => {
  const response = await api.post(
    "/monitoring/event",
    data
  );

  return response.data;
};


// Add Manual Violation
export const addViolation = async (data) => {
  const response = await api.post(
    "/monitoring/violation",
    data
  );

  return response.data;
};


// End Monitoring
export const endMonitoring = async (data) => {
  const response = await api.post(
    "/monitoring/end",
    data
  );

  return response.data;
};


// Get Monitoring Session
export const getMonitoring = async (monitoringId) => {
  const response = await api.get(
    `/monitoring/${monitoringId}`
  );

  return response.data;
};


// Get All Monitoring Sessions
export const getAllMonitoring = async () => {
  const response = await api.get(
    "/monitoring"
  );

  return response.data;
};


// Get Monitoring By Interview
export const getMonitoringByInterview = async (
  interviewId
) => {
  const response = await api.get(
    `/monitoring/interview/${interviewId}`
  );

  return response.data;
};


// Get Monitoring By Student
export const getMonitoringByStudent = async (
  studentId
) => {
  const response = await api.get(
    `/monitoring/student/${studentId}`
  );

  return response.data;
};


// Get Monitoring By Organization
export const getMonitoringByOrganization = async (
  organizationId
) => {
  const response = await api.get(
    `/monitoring/organization/${organizationId}`
  );

  return response.data;
};


// Delete Monitoring
export const deleteMonitoring = async (
  monitoringId
) => {
  const response = await api.delete(
    `/monitoring/${monitoringId}`
  );

  return response.data;
};
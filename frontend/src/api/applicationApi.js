import api from "./axios";

// =============================
// Apply for Job
// =============================

export const applyJob = async (data) => {
  const response = await api.post(
    "/applications/apply",
    data
  );

  return response.data;
};

// =============================
// Get All Applications
// =============================

export const getAllApplications = async () => {
  const response = await api.get(
    "/applications/"
  );

  return response.data;
};

// =============================
// Get Application By ID
// =============================

export const getApplication = async (
  applicationId
) => {
  const response = await api.get(
    `/applications/${applicationId}`
  );

  return response.data;
};

// =============================
// Get Applications By Student
// =============================

export const getApplicationsByStudent = async (
  studentId
) => {
  const response = await api.get(
    `/applications/student/${studentId}`
  );

  return response.data;
};

// =============================
// Get Applications By Organization
// =============================

export const getApplicationsByOrganization = async (
  organizationId
) => {
  const response = await api.get(
    `/applications/organization/${organizationId}`
  );

  return response.data;
};

// =============================
// Get Applications By Job
// =============================

export const getApplicationsByJob = async (
  jobId
) => {
  const response = await api.get(
    `/applications/job/${jobId}`
  );

  return response.data;
};

// =============================
// Update Application Status
// =============================

export const updateApplicationStatus = async (
  applicationId,
  data
) => {
  const response = await api.put(
    `/applications/${applicationId}/status`,
    data
  );

  return response.data;
};

// =============================
// Delete Application
// =============================

export const deleteApplication = async (
  applicationId
) => {
  const response = await api.delete(
    `/applications/${applicationId}`
  );

  return response.data;
};
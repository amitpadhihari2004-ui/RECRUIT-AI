import api from "./axios";

// =============================
// Create Job
// =============================
export const createJob = async (organizationId, data) => {
  const response = await api.post(
    `/jobs/create?organization_id=${organizationId}`,
    data
  );
  return response.data;
};

// =============================
// Get All Jobs
// =============================
export const getAllJobs = async () => {
  const response = await api.get("/jobs/");
  return response.data;
};

// =============================
// Get Published Jobs (Student)
// =============================
export const getPublishedJobs = async () => {
  const response = await api.get("/jobs/published");
  return response.data;
};

// =============================
// Get Jobs By Organization
// =============================
export const getJobsByOrganization = async (organizationId) => {
  const response = await api.get(
    `/jobs/organization/${organizationId}`
  );
  return response.data;
};

// =============================
// Get Job By ID
// =============================
export const getJob = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

// =============================
// Update Job
// =============================
export const updateJob = async (jobId, data) => {
  const response = await api.put(
    `/jobs/${jobId}`,
    data
  );
  return response.data;
};

// =============================
// Publish Job
// =============================
export const publishJob = async (jobId) => {
  const response = await api.put(
    `/jobs/publish/${jobId}`
  );
  return response.data;
};

// =============================
// Close Job
// =============================
export const closeJob = async (jobId) => {
  const response = await api.put(
    `/jobs/close/${jobId}`
  );
  return response.data;
};

// =============================
// Delete Job
// =============================
export const deleteJob = async (jobId) => {
  const response = await api.delete(
    `/jobs/${jobId}`
  );
  return response.data;
};
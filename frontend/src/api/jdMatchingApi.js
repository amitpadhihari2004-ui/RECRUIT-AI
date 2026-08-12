import api from "./axios";

// ==========================================
// Match Resume With Job
// ==========================================

export const matchResumeWithJob = async (
  resumeId,
  jobId
) => {
  const response = await api.post(
    "/jd-matching/match",
    {
      resume_id: resumeId,
      job_id: jobId,
    }
  );

  return response.data;
};


// ==========================================
// Get Match Result
// ==========================================

export const getMatchResult = async (
  matchId
) => {
  const response = await api.get(
    `/jd-matching/${matchId}`
  );

  return response.data;
};


// ==========================================
// Get All Match Results
// ==========================================

export const getAllMatchResults = async () => {
  const response = await api.get(
    "/jd-matching/"
  );

  return response.data;
};


// ==========================================
// Get Matches By Student
// ==========================================

export const getMatchesByStudent = async (
  studentId
) => {
  const response = await api.get(
    `/jd-matching/student/${studentId}`
  );

  return response.data;
};


// ==========================================
// Get Matches By Job
// ==========================================

export const getMatchesByJob = async (
  jobId
) => {
  const response = await api.get(
    `/jd-matching/job/${jobId}`
  );

  return response.data;
};


// ==========================================
// Delete Match Result
// ==========================================

export const deleteMatchResult = async (
  matchId
) => {
  const response = await api.delete(
    `/jd-matching/${matchId}`
  );

  return response.data;
};
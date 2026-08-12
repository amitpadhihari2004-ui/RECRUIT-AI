import api from "./axios";


// =========================================================
// GENERATE RANKING
// =========================================================

export const generateRanking = async (jobId) => {

  const response = await api.post(
    `/ranking/generate/${jobId}`
  );

  return response.data;
};


// =========================================================
// REGENERATE RANKING
// =========================================================

export const regenerateRanking = async (jobId) => {

  const response = await api.post(
    `/ranking/regenerate/${jobId}`
  );

  return response.data;
};


// =========================================================
// GET ALL RANKINGS
// =========================================================

export const getAllRankings = async () => {

  const response = await api.get(
    "/ranking/"
  );

  return response.data;
};


// =========================================================
// GET RANKINGS BY JOB
// =========================================================

export const getRankingsByJob = async (jobId) => {

  const response = await api.get(
    `/ranking/job/${jobId}`
  );

  return response.data;
};


// =========================================================
// GET TOP CANDIDATES
// =========================================================

export const getTopCandidates = async (
  jobId,
  limit = 10
) => {

  const response = await api.get(
    `/ranking/job/${jobId}/top`,
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
};


// =========================================================
// GET RANKING STATISTICS
// =========================================================

export const getRankingStatistics = async (jobId) => {

  const response = await api.get(
    `/ranking/job/${jobId}/statistics`
  );

  return response.data;
};


// =========================================================
// GET RANKINGS BY STUDENT
// =========================================================

export const getRankingsByStudent = async (
  studentId
) => {

  const response = await api.get(
    `/ranking/student/${studentId}`
  );

  return response.data;
};


// =========================================================
// GET SINGLE RANKING
// =========================================================

export const getRanking = async (rankingId) => {

  const response = await api.get(
    `/ranking/${rankingId}`
  );

  return response.data;
};


// =========================================================
// GET CANDIDATE RANKING SUMMARY
// =========================================================

export const getCandidateRankingSummary = async (
  rankingId
) => {

  const response = await api.get(
    `/ranking/summary/${rankingId}`
  );

  return response.data;
};


// =========================================================
// UPDATE CANDIDATE DECISION
// =========================================================
//
// Available decisions:
//
// Selected
// Shortlisted
// Under Review
// On Hold
// Rejected
//
// Example:
//
// updateCandidateDecision(
//   rankingId,
//   "Selected",
//   "Excellent candidate"
// )
//
// =========================================================

export const updateCandidateDecision = async (
  rankingId,
  decision,
  reason = ""
) => {

  const response = await api.patch(
    `/ranking/${rankingId}/decision`,
    null,
    {
      params: {
        decision,
        reason,
      },
    }
  );

  return response.data;
};


// =========================================================
// RESET CANDIDATE DECISION
// =========================================================
//
// Restores the original AI-generated decision.
//
// =========================================================

export const resetCandidateDecision = async (
  rankingId
) => {

  const response = await api.patch(
    `/ranking/${rankingId}/decision/reset`
  );

  return response.data;
};


// =========================================================
// DELETE SINGLE RANKING
// =========================================================

export const deleteRanking = async (
  rankingId
) => {

  const response = await api.delete(
    `/ranking/${rankingId}`
  );

  return response.data;
};


// =========================================================
// DELETE ALL RANKINGS FOR JOB
// =========================================================

export const deleteJobRankings = async (
  jobId
) => {

  const response = await api.delete(
    `/ranking/job/${jobId}`
  );

  return response.data;
};
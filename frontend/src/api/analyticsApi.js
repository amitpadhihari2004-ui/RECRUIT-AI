import api from "./axios";


// =========================================================
// HELPER - VALIDATE ID
// =========================================================

const requireId = (
  value,
  name
) => {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {

    throw new Error(
      `${name} is required.`
    );

  }

  return String(value).trim();

};


// =========================================================
// GET STUDENT ANALYTICS
// =========================================================
//
// GET
// /analytics/student/{student_id}
//
// Returns analytics ONLY for the requested student.
//
// =========================================================

export const getStudentAnalytics = async (
  studentId
) => {

  const id = requireId(
    studentId,
    "Student ID"
  );

  const response = await api.get(
    `/analytics/student/${id}`
  );

  return response.data;

};


// =========================================================
// GENERATE STUDENT DASHBOARD
// =========================================================
//
// POST
// /analytics/student/{student_id}/generate
//
// Generates and saves fresh analytics ONLY
// for this student.
//
// =========================================================

export const generateStudentDashboard = async (
  studentId
) => {

  const id = requireId(
    studentId,
    "Student ID"
  );

  const response = await api.post(
    `/analytics/student/${id}/generate`
  );

  return response.data;

};


// =========================================================
// GET SAVED STUDENT DASHBOARD
// =========================================================
//
// GET
// /analytics/student/{student_id}/dashboard
//
// Returns the latest saved analytics dashboard
// for this student.
//
// =========================================================

export const getStudentDashboard = async (
  studentId
) => {

  const id = requireId(
    studentId,
    "Student ID"
  );

  const response = await api.get(
    `/analytics/student/${id}/dashboard`
  );

  return response.data;

};


// =========================================================
// REFRESH STUDENT DASHBOARD
// =========================================================
//
// POST
// /analytics/student/{student_id}/refresh
//
// Recalculates analytics ONLY for this student.
//
// =========================================================

export const refreshStudentDashboard = async (
  studentId
) => {

  const id = requireId(
    studentId,
    "Student ID"
  );

  const response = await api.post(
    `/analytics/student/${id}/refresh`
  );

  return response.data;

};


// =========================================================
// DELETE STUDENT DASHBOARD
// =========================================================
//
// DELETE
// /analytics/student/{student_id}
//
// Deletes analytics ONLY for this student.
//
// It does NOT delete:
// - Student
// - Resume
// - Applications
// - Interviews
// - Jobs
//
// =========================================================

export const deleteStudentDashboard = async (
  studentId
) => {

  const id = requireId(
    studentId,
    "Student ID"
  );

  const response = await api.delete(
    `/analytics/student/${id}`
  );

  return response.data;

};


// =========================================================
// GET CURRENT STUDENT ID
// =========================================================
//
// Login.jsx normally stores:
//
// user_id
//
// Fallbacks are supported for compatibility.
//
// =========================================================

export const getCurrentStudentId = () => {

  const studentId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("studentId") ||
    localStorage.getItem("student_id");

  if (
    !studentId ||
    String(studentId).trim() === ""
  ) {

    throw new Error(
      "Student ID not found. Please login again."
    );

  }

  return String(studentId).trim();

};


// =========================================================
// GET MY ANALYTICS
// =========================================================
//
// Automatically uses the currently logged-in student.
//
// Usage:
//
// const data = await getMyAnalytics();
//
// =========================================================

export const getMyAnalytics = async () => {

  const studentId =
    getCurrentStudentId();

  return getStudentAnalytics(
    studentId
  );

};


// =========================================================
// GENERATE MY DASHBOARD
// =========================================================
//
// Generates analytics for the currently
// logged-in student.
//
// =========================================================

export const generateMyDashboard = async () => {

  const studentId =
    getCurrentStudentId();

  return generateStudentDashboard(
    studentId
  );

};


// =========================================================
// GET MY SAVED DASHBOARD
// =========================================================
//
// Gets the saved dashboard for the currently
// logged-in student.
//
// =========================================================

export const getMyDashboard = async () => {

  const studentId =
    getCurrentStudentId();

  return getStudentDashboard(
    studentId
  );

};


// =========================================================
// REFRESH MY DASHBOARD
// =========================================================
//
// Refreshes analytics for the currently
// logged-in student.
//
// =========================================================

export const refreshMyDashboard = async () => {

  const studentId =
    getCurrentStudentId();

  return refreshStudentDashboard(
    studentId
  );

};


// =========================================================
// DELETE MY DASHBOARD
// =========================================================
//
// Deletes analytics for the currently
// logged-in student.
//
// =========================================================

export const deleteMyDashboard = async () => {

  const studentId =
    getCurrentStudentId();

  return deleteStudentDashboard(
    studentId
  );

};
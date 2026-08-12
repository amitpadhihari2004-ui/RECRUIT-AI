import api from "./axios";

// ==============================
// Student Signup
// ==============================

export const signupUser = async (userData) => {
  const response = await api.post(
    "/users/signup",
    userData
  );

  return response.data;
};

// ==============================
// Student Login
// ==============================

export const loginUser = async (loginData) => {
  const response = await api.post(
    "/users/login",
    loginData
  );

  return response.data;
};

// ==============================
// Student Logout
// ==============================

export const logoutUser = async () => {
  const response = await api.post(
    "/users/logout"
  );

  return response.data;
};

// ==============================
// Get Student Profile
// ==============================

export const getProfile = async (userId) => {
  const response = await api.get(
    `/users/profile/${userId}`
  );

  return response.data;
};

// ==============================
// Update Student Profile
// ==============================

export const updateProfile = async (
  userId,
  data
) => {
  const response = await api.put(
    `/users/profile/${userId}`,
    data
  );

  return response.data;
};
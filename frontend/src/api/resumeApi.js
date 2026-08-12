import api from "./axios";

export const uploadResume = async (userId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  console.log("================================");
  console.log("UPLOAD DEBUG");
  console.log("User ID:", userId);
  console.log("File:", file);
  console.log("File name:", file?.name);
  console.log("File type:", file?.type);
  console.log("File size:", file?.size);

  for (const [key, value] of formData.entries()) {
    console.log("FormData:", key, value);
  }

  console.log("================================");

  try {
    const response = await api.post(
      `/resume/upload?user_id=${encodeURIComponent(userId)}`,
      formData
    );

    console.log("UPLOAD SUCCESS:", response.data);

    return response.data;

  } catch (error) {

    console.log("================================");
    console.log("BACKEND UPLOAD ERROR");
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("DETAIL:", error.response?.data?.detail);
    console.log("================================");

    throw error;
  }
};


export const analyzeResume = async (resumeId) => {
  const response = await api.post(
    `/resume/${resumeId}/analyze`
  );

  return response.data;
};


export const getResumeAnalysis = async (resumeId) => {
  const response = await api.get(
    `/resume/${resumeId}/analysis`
  );

  return response.data;
};


export const getResume = async (resumeId) => {
  const response = await api.get(
    `/resume/${resumeId}`
  );

  return response.data;
};


export const getAllResumes = async () => {
  const response = await api.get("/resume/");
  return response.data;
};


export const getUserResumes = async (userId) => {
  const response = await api.get(
    `/resume/user/${userId}`
  );

  return response.data;
};


export const deleteResume = async (resumeId) => {
  const response = await api.delete(
    `/resume/${resumeId}`
  );

  return response.data;
};
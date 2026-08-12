import api from "./axios";


export const getRecommendedJobs = async (userId) => {
  const response = await api.get(
    `/recommendations/${userId}`
  );

  return response.data;
};
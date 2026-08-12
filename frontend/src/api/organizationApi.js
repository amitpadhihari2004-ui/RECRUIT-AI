import api from "./axios";


export const organizationSignup = async (data) => {

  const response = await api.post(
    "/organization/signup",
    data
  );

  return response.data;
};



export const organizationLogin = async (data) => {

  const response = await api.post(
    "/organization/login",
    data
  );

  return response.data;
};



export const getAllOrganizations = async () => {

  const response = await api.get(
    "/organization"
  );

  return response.data;
};



export const getOrganizationProfile = async (
  organizationId
) => {

  const response = await api.get(
    `/organization/${organizationId}`
  );

  return response.data;
};



export const updateOrganizationProfile = async (
  organizationId,
  data
) => {

  const response = await api.put(
    `/organization/${organizationId}`,
    data
  );

  return response.data;
};


export const deleteOrganization = async (
  organizationId
) => {

  const response = await api.delete(
    `/organization/${organizationId}`
  );

  return response.data;
};
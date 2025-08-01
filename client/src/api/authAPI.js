import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/api/token/", credentials);
  return response.data; // contains access & refresh
};

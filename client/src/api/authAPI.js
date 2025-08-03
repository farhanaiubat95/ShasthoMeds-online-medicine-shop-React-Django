import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/api/token/", credentials);
  return response.data; // contains access & refresh
};


import axios from "axios";

export const registerUser = async (userData) => {
  const response = await axios.post(`https://shasthomeds-backend.onrender.com/api/register/
`, userData, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: True, // If needed for cookies/session
  });
  return response.data;
};


import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/api/token/", credentials);
  return response.data; // contains access & refresh
};


import axios from "axios";

const BASE_URL = "https://shasthomeds-backend.onrender.com";
 // make sure this matches the deployed backend

export const registerUser = async (userData) => {
  const response = await axios.post(`https://shasthomeds-backend.onrender.com/register/`, userData, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false, // If needed for cookies/session
  });
  return response.data;
};

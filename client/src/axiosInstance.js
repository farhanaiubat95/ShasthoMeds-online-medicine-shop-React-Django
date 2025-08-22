// src/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://shasthomeds-backend.onrender.com",
});

// Attach token automatically for every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

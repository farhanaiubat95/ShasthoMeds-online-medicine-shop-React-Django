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

export const getCsrfToken = async () => {
  try {
    const response = await fetch("https://shasthomeds-backend.onrender.com/api/csrf/", {
      method: "GET",
      credentials: "include", // Send cookies
      mode: "cors", // Explicitly set CORS mode
    });
    if (!response.ok) throw new Error("Failed to fetch CSRF token");
    const data = await response.json();
    return data.csrfToken; // Adjust based on your backend response
  } catch (error) {
    console.error("CSRF Fetch Error:", error);
    throw error;
  }
};

import axios from "axios";
import BASE_URL from "../config";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // using JWT tokens, so no cookies
});

export default axiosInstance;

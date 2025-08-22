import axios from "axios";
import { store } from "./redux/store.js"; // Adjust path to your Redux store
import { setUserData, logoutUser } from "./redux/userSlice.js"; // Adjust path

const axiosInstance = axios.create({
  baseURL: "https://shasthomeds-backend.onrender.com",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) {
          store.dispatch(logoutUser());
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const response = await axios.post(
          "https://shasthomeds-backend.onrender.com/api/token/refresh/",
          { refresh: refresh_token }
        );
        const { access } = response.data;
        localStorage.setItem("access_token", access);
        store.dispatch(
          setUserData({
            user: JSON.parse(localStorage.getItem("user")),
            access_token: access,
            refresh_token: localStorage.getItem("refresh_token"),
          })
        );
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logoutUser());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
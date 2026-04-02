import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "auth_token";

// 180s — avoids 15s timeout hits from Render cold starts & slow SMTP operations.
const TIMEOUT = 180000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Đã có lỗi xảy ra";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;

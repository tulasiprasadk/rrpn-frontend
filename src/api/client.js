import axios from "axios";
import { API_BASE } from "../config/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Attach Authorization header with JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Unable to connect to server. Please check your internet connection.';
    }
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.';
    }
    // Handle 5xx errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    // Handle 404 errors
    if (error.response?.status === 404) {
      error.message = 'Resource not found.';
    }
    return Promise.reject(error);
  }
);

// Do not export API_BASE directly. Always import where needed.
export default api;




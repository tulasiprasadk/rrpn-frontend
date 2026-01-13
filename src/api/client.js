import axios from "axios";
import { API_BASE } from "../config/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach Authorization header with JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Do not export API_BASE directly. Always import where needed.
export default api;




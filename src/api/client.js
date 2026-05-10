import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function getTokenForRequest(url = "") {
  const normalizedUrl = String(url || "");

  const customerToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const supplierToken = localStorage.getItem("supplierToken");

  if (normalizedUrl.includes("/admin")) {
    return adminToken || customerToken || supplierToken;
  }

  if (normalizedUrl.includes("/supplier")) {
    return supplierToken || customerToken || adminToken;
  }

  return customerToken || adminToken || supplierToken;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Only attach token for internal API calls
    if (config.url && !/^https?:\/\//.test(config.url)) {
      const token = getTokenForRequest(config.url);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (centralized error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (error.code === "ERR_NETWORK") {
      error.message = "Unable to connect to server. Check your internet.";
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    }

    // Server errors
    if (error.response?.status >= 500) {
      error.message = "Server error. Please try again later.";
    }

    // Not found
    if (error.response?.status === 404) {
      error.message = "Resource not found.";
    }

    console.error("API Error:", error?.response || error.message);

    return Promise.reject(error);
  }
);

export default api;
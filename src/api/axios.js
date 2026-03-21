// src/api/axios.js
import axios from 'axios';
import { API_BASE, resolveApiRequestUrl } from '../config/api';

// Single axios instance that points to the backend API base.
// Using an absolute base (`API_BASE`) avoids accidental requests to the
// dev server root and ensures /api requests target the backend at port 5000.
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send cookies for session support
});

api.interceptors.request.use((config) => {
  const nextUrl = resolveApiRequestUrl(config.url || "");
  if (nextUrl) {
    config.url = nextUrl;
  }
  return config;
});

export default api;




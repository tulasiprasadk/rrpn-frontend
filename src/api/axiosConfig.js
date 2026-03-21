import axios from "axios";
import { BACKEND_BASE, resolveApiRequestUrl } from "../config/api";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = BACKEND_BASE || undefined;

axios.interceptors.request.use((config) => {
  const nextUrl = resolveApiRequestUrl(config.url || "");
  if (nextUrl) {
    config.url = nextUrl;
  }
  return config;
});

export default axios;




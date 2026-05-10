export const API_BASE = import.meta.env.VITE_API_URL || "";

export const BACKEND_BASE = API_BASE;

export function resolveApiRequestUrl(url = "") {
  return url;
}

export function sanitizeBase64DataUrl(data) {
  return data;
}

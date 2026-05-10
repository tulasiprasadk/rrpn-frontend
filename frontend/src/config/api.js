// ✅ TEMP COMPATIBILITY LAYER (DO NOT REMOVE YET)

export const API_BASE = import.meta.env.VITE_API_URL || "";

// Keep for backward compatibility
export const BACKEND_BASE = API_BASE;

// Old function (kept so old code doesn't break)
export function resolveApiRequestUrl(url = "") {
  return url;
}

// Keep if used anywhere
export function sanitizeBase64DataUrl(data) {
  return data;
}
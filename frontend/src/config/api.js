// Compatibility layer for Vite + Vercel serverless API routing.
function normalizeApiBase(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");

  if (!raw) return "/api";
  if (raw.endsWith("/api")) return raw;
  if (/rrpn-backend\.vercel\.app$/i.test(raw) || /backend-[^.]+\.vercel\.app$/i.test(raw)) {
    return `${raw}/api`;
  }

  return raw;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);

export const BACKEND_BASE = API_BASE;

export function resolveApiRequestUrl(url = "") {
  return url;
}

export function sanitizeBase64DataUrl(data) {
  return data;
}

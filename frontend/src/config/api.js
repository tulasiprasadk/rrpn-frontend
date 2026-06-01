// Normalize API base URL for Vercel + local dev
function normalizeApiBase(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");

  // Default fallback
  if (!raw) return "/api";

  // Already ends with /api
  if (raw.endsWith("/api")) return raw;

  // If it's your Vercel backend → append /api
  if (
    /rrpn-backend\.vercel\.app$/i.test(raw) ||
    /backend-[^.]+\.vercel\.app$/i.test(raw)
  ) {
    return `${raw}/api`;
  }

  return raw;
}

// Final API base
export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
);

export const BACKEND_BASE = API_BASE;

// 🔥 CRITICAL FIX — THIS WAS YOUR BUG
export function resolveApiRequestUrl(url = "") {
  const cleanUrl = String(url || "").trim();

  // If already full URL → use as-is
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }
  if (cleanUrl === API_BASE || cleanUrl.startsWith(`${API_BASE}/`)) {
    return cleanUrl;
  }

  // Ensure leading slash
  const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

  return `${API_BASE}${path}`;
}

// (leave as-is if not used)
export function sanitizeBase64DataUrl(data) {
  return data;
}

function normalizeApiBase(value) {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "rrnagar.com" || host === "www.rrnagar.com") {
      return "/api";
    }
  }

  const raw = String(value || "").trim().replace(/\/+$/, "");

  if (!raw) return "/api";
  if (raw.endsWith("/api")) return raw;

  if (
    /rrpn-backend\.vercel\.app$/i.test(raw) ||
    /backend-[^.]+\.vercel\.app$/i.test(raw)
  ) {
    return `${raw}/api`;
  }

  return raw;
}

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
);

export const BACKEND_BASE = API_BASE;

export function resolveApiRequestUrl(url = "") {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return cleanUrl;
  if (/^https?:\/\//i.test(cleanUrl)) {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "rrnagar.com" || window.location.hostname === "www.rrnagar.com") &&
      /rrpn-backend\.vercel\.app\/api\//i.test(cleanUrl)
    ) {
      return cleanUrl.replace(/^https:\/\/rrpn-backend\.vercel\.app\/api/i, "/api");
    }
    return cleanUrl;
  }
  if (cleanUrl === API_BASE || cleanUrl.startsWith(`${API_BASE}/`)) {
    return cleanUrl;
  }

  const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
  return `${API_BASE}${path}`;
}

export function sanitizeBase64DataUrl(data) {
  return data;
}

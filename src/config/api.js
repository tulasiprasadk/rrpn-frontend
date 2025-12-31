const BASE = import.meta.env.VITE_API_BASE?.trim();

if (!BASE) {
  throw new Error("❌ VITE_API_BASE is not defined");
}

// ✅ Backend mounts routes under /api
export const API_BASE = `${BASE}/api`;

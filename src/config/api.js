const BASE = import.meta.env.VITE_API_BASE?.trim();

if (!BASE) {
  throw new Error("❌ VITE_API_BASE is not defined");
}

// ❗ DO NOT append /api here
export const API_BASE = BASE;

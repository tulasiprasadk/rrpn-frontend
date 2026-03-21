// Prefer build-time Vite env `VITE_API_BASE_URL`, fall back to a restart-safe
// runtime default so dev server and containerized setups work. In Vite dev
// (port 5173) prefer the backend on localhost:3000 so browser API requests
// are proxied to the running backend during development.
const BASE = import.meta.env.VITE_API_BASE_URL?.trim()
  || (typeof window !== 'undefined' && (window.__RRN_API_BASE || (window.location.port === '5173' ? 'http://localhost:3000' : window.location.origin)))
  || 'http://localhost:3000';

// ✅ Backend mounts routes under /api
export const API_BASE = `${BASE.replace(/\/$/, '')}/api`;

// Export BASE for document/file URLs (served from backend root, not /api)
export const BACKEND_BASE = BASE.replace(/\/$/, '');

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    BASE,
    API_BASE,
    BACKEND_BASE,
    envVar: import.meta.env.VITE_API_BASE_URL || 'using default=http://localhost:3000'
  });
}




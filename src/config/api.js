// Prefer build-time Vite env, fall back to a runtime default so dev server and
// containerized setups work even if /@vite/env wasn't injected.
const BASE = import.meta.env.VITE_API_BASE?.trim() || (typeof window !== 'undefined' && window.__RRN_API_BASE) || 'http://localhost:3000';

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
    env: import.meta.env.VITE_API_BASE || 'using default/localhost'
  });
}




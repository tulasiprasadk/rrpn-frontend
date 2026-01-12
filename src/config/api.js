// API Configuration for RRNP
const BASE = import.meta.env.VITE_API_BASE?.trim() || (typeof window !== 'undefined' && window.__RRN_API_BASE) || 'http://localhost:3000';

// Backend mounts routes under /api
export const API_BASE = `${BASE.replace(/\/$/, '')}/api`;

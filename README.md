# RR-NAGAR — local dev helpers

This adds a Vite proxy and helper scripts so the frontend uses the mock backend reliably during development.

What was added
- frontend/vite.config.js — Vite dev-server proxy so `/api/*` requests are forwarded to `http://localhost:3000`.
- frontend/.env.example — documents VITE_API_URL usage.
- start-all.ps1 — Windows helper that starts backend and frontend in separate PowerShell windows (frontend gets VITE_API_URL).
- docker-compose.yml — optional: run backend + frontend in containers.
- README.md — this file.

Quick local run (Windows)
1. From repo root, run:
   .\start-all.ps1

2. Watch the two new PowerShell windows:
   - Backend window should show "Mock API listening on http://localhost:3000" (or similar).
   - Frontend window (Vite) shows the Local URL (usually http://localhost:5173 or fallback).

3. Open the Vite URL in the browser and verify:
   - DevTools → Network → XHR: confirm GET /api/products returns JSON.
   - Or run:
     curl -i "http://localhost:3000/api/products"   # backend direct
     curl -i "http://localhost:5173/api/products"   # proxied via Vite (if proxy active)

Quick Docker run (optional)
1. docker-compose up --build
2. Backend: http://localhost:3000
   Frontend: http://localhost:5173

If products or admin/supplier panels still do not appear
1. Confirm backend returns JSON:
   curl -i "http://localhost:3000/api/products"

2. Confirm frontend request URL in DevTools (Network → XHR) — it should be proxied to the backend or use import.meta.env.VITE_API_URL.

3. Paste any console errors here and I’ll diagnose.

Notes
- If a vite.config.js already existed, merge the server.proxy object instead of overwriting unrelated options.
- If your frontend already uses import.meta.env.VITE_API_URL, the start script sets it. If it uses relative /api paths, the proxy handles them.

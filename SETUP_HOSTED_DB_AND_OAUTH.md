Provision a hosted Postgres and configure Google OAuth (quick steps)

This file lists minimal steps to:
- Provision a hosted Postgres (Supabase or Render)
- Configure Google OAuth credentials
- Add secrets to GitHub and deployment environment

Summary (recommended):
1. Create a Supabase project (or use Render Postgres) and copy the Postgres connection string.
2. Create Google OAuth credentials in Google Cloud Console; set authorized redirect URIs to match your backend (see below).
3. Add secrets to the repository (GitHub repository Settings → Secrets) and to your hosting platform (Render/Heroku/Vercel).
4. Restart your backend (or redeploy) so it uses the hosted DB and OAuth credentials.

Supabase quick steps
- Open https://app.supabase.com and create a new project.
- In Project → Settings → Database → Connection string, copy the `postgresql://...` connection string.
- Optionally enable SSL depending on the provider.

Google OAuth quick steps
- Open https://console.cloud.google.com/apis/credentials
- Create OAuth 2.0 Client ID (type: Web application)
- Add Authorized redirect URIs for customers and suppliers, e.g.:
  - https://<YOUR_BACKEND_HOST>/api/customers/auth/google/callback
  - https://<YOUR_BACKEND_HOST>/api/suppliers/auth/google/callback
  For local testing, if backend is reachable at `http://localhost:3001` use:
  - http://localhost:3001/api/customers/auth/google/callback
  - http://localhost:3001/api/suppliers/auth/google/callback
- Copy `Client ID` and `Client secret`.

Set secrets (GitHub & deployment)
- Add the following repository secrets (GitHub repo → Settings → Secrets → Actions or Codespaces):
  - `DATABASE_URL` = the Supabase/Render connection string
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `FRONTEND_URL` = your frontend origin (e.g. https://myapp.example or http://localhost:5173 for dev)
  - `JWT_SECRET` = a random long secret
- Also add the same env vars to your hosting platform (Render service env, Vercel, or wherever you deploy the backend).

Local dev notes
- Keep a local `backend.env` with the real secrets for local development. DO NOT commit this file.
- After changing `backend.env`, restart the backend server or container:

```bash
# from repo root
cd frontend
# if using docker-compose
docker compose -f docker-compose.yml up -d backend
# or if running node directly
npm --prefix backend run dev
```

Deploy notes (Render/Vercel)
- Render: create a Web Service for the backend, set environment variables from the repo secrets, and set the Postgres add-on or add the Supabase connection as `DATABASE_URL`.
- Vercel: typically used for frontend; if backend is in Vercel functions, set env vars in the Vercel dashboard.

After deployment
- Confirm `/api/auth/status` returns `{"googleConfigured":true,"frontendUrl":"..."}`
- Open the login page and click "Sign in with Google"; complete the consent flow and ensure the callback redirects back to the frontend with the auth token.

If you want, I can:
- Add a short GitHub Actions workflow to deploy the backend to Render/Vercel (requires service config)
- Help set the repo secrets (I cannot create cloud projects or set external secrets, but I can provide exact commands for `gh secret set` or the Render API)


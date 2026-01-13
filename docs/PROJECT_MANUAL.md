# Project Manual — RRN Frontend

## 1. Purpose
This document describes the frontend architecture, how modules link together, development and build flows, CI/linting, deployment notes, and troubleshooting tips for the project in this workspace.

## 2. High-level architecture

Mermaid flow (open in a renderer that supports mermaid):

```mermaid
flowchart TD
  Browser[User Browser]
  Browser -->|loads| Index[index.html]
  Index --> Main[`src/main.jsx`]
  Main --> App[`src/App.jsx`]
  App --> Router[`src/router.jsx`]
  Router --> Pages[Pages (src/pages/**)]
  Pages --> Components[Components (src/components/**)]
  Pages --> API[`src/api/*`]
  API --> Backend[Backend HTTP API]
  App --> Auth[`src/auth0-provider.jsx`]
  App --> Contexts[`src/context/**`]
  Components --> Styles[`src/**/*.css`]

  subgraph Build
    Main -->|vite build| Dist[dist/]
  end
```

This shows the runtime flow: browser loads `index.html`, which mounts `main.jsx`. `App.jsx` sets up global providers (auth/session), the router renders page components which use shared `components`, `api` client and `context` modules to fetch data and manage state.

## 3. Key files and where to find them
- Application entry: [src/main.jsx](src/main.jsx)
- Root UI: [src/App.jsx](src/App.jsx)
- Router: [src/router.jsx](src/router.jsx)
- Auth provider: [src/auth0-provider.jsx](src/auth0-provider.jsx)
- API client(s): [src/api/axiosConfig.js](src/api/axiosConfig.js), [src/api/client.js](src/api/client.js)
- Pages: [src/pages/](src/pages)
- Reusable components: [src/components/](src/components)
- Global styles: [src/index.css](src/index.css), [src/global.css](src/global.css)
- Lint configs: [eslint.config.js](eslint.config.js), [.stylelintrc.json](.stylelintrc.json)
- Build config: [vite.config.js](vite.config.js)
- CI workflows: [.github/workflows/css-lint.yml](.github/workflows/css-lint.yml)

## 4. Module mapping and responsibilities
- src/pages: Page-level containers tied to routes in `router.jsx`. They orchestrate data fetching and compose components.
- src/components: Presentational and shared interactive widgets (headers, footers, product cards, cart UI, forms).
- src/api: axios configuration and API wrapper functions used by pages and components.
- src/context: React contexts (cart, session, app-level state) used across the app.
- src/admin, src/supplier: Admin and supplier sub-apps with their own pages/components; share `api` client.
- src/styles and css files: CSS modules and global styles referenced by components.
- public/ and src/assets: static assets, images and uploads referenced by components.

## 5. Data flow and example request
1. User visits a product page → router loads `ProductDetail` page.
2. Page calls an `api` wrapper in `src/api/*` (axios client configured in [src/api/axiosConfig.js](src/api/axiosConfig.js)).
3. API responds; page stores results in state or context and renders child `components`.
4. Component events (add to cart) dispatch to `context` (cart/session) and optionally call backend endpoints.

## 6. How parts link (practical notes)
- Routing: add route entries in [src/router.jsx](src/router.jsx) mapping path → page component.
- API: All network calls should use `client.js`/`axiosConfig.js` to share baseURL and interceptors (auth tokens). This centralizes error handling.
- Auth: `auth0-provider.jsx` wraps `App` so page components can use `useAuth0()` or `session.js` utilities.
- CSS: Components import or reference CSS files under `src/` (global/globalized CSS). New components should add their CSS in `src/components/<name>.css`.

## 7. Development: run & build
- Install deps:

```bash
npm ci
```

- Local dev server:

```bash
npm run dev
# open http://localhost:5173 (Vite default)
```

- Production build:

```bash
npm run build
npm run preview
```

Build artifacts appear in `dist/`.

## 8. Linting and formatting
- JavaScript/JSX linting: `npm run lint` runs ESLint over `.js/.jsx/.ts/.tsx`.
- CSS linting: `npm run lint:css` runs Stylelint. A dedicated CI job exists at `.github/workflows/css-lint.yml` that runs stylelint separately and uploads a JSON report.

Notes: The stylelint config is currently conservative to avoid unknown-rule errors. You can incrementally enable more rules in `.stylelintrc.json` and fix issues.

## 9. CI
- CSS lint workflow: [.github/workflows/css-lint.yml](.github/workflows/css-lint.yml) — runs on pushes/PRs touching `src/**/*.css`, uploads `stylelint-report.json`, and is non-blocking.
- JS lint and build are expected to run in your main CI; consider adding `npm run lint` and `npm run build` steps in your main pipeline.

## 10. Adding a new feature (checklist)
1. Create page component under `src/pages` and corresponding route in [src/router.jsx](src/router.jsx).
2. Create presentational components in `src/components` and CSS in `src/components/<name>.css`.
3. Use `src/api/*` for network calls and `src/context` for shared state if needed.
4. Add unit tests to `src/__tests__` when applicable.
5. Run linters: `npm run lint` and `npm run lint:css`.
6. Build: `npm run build`.

## 11. Troubleshooting common issues
- Build parse errors: check for stray JSX or missing commas in route arrays; ESLint parse errors usually point to the offending file.
- Unknown stylelint rules: your local `stylelint` might miss plugins; ensure `stylelint` and `stylelint-config-standard` versions match and that `.stylelintrc.json` contains supported rules.
- Large Vite chunks: Vite may warn about large vendor bundles; consider dynamic imports or optimizing dependencies in `vite.config.js`.

## 12. Next improvements and suggestions
- Add a main CI workflow that runs `npm run lint` and `npm run build` on PRs to prevent regressions.
- Gradually enable stricter stylelint rules and fix CSS issues in batches.
- Add unit/integration tests for critical pages (cart, checkout, auth flows).
- Create a simple system diagram image (PNG/SVG) in `docs/` for onboarding non-technical stakeholders.

## 14. Canonical repository URLs (use these for deploys/CI)

- **Frontend repo:** https://github.com/tulasiprasadk/rrnagarfinal-frontend
- **Backend repo:** https://github.com/tulasiprasadk/rrnagarfinal-backend

Add these to your environment in CI or local `.env` as `GITHUB_FRONTEND_REPO` and `GITHUB_BACKEND_REPO`.

## 13. Deliverables created
- This manual: `docs/PROJECT_MANUAL.md` in the repo root (this file).

---

If you'd like, I can also:
- Export the mermaid diagrams to an SVG and commit it to `docs/`.
- Generate a summarized onboarding README for new contributors.
- Start adding a main CI workflow that runs JS lint/build on PRs.

Tell me which of these you'd like me to do next.

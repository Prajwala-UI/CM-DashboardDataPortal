# 12 — Configuration, Testing and Deployment

Diagram: [flowcharts/10_build_and_deployment.md](flowcharts/10_build_and_deployment.md).

## 1. Environment selection

`REACT_APP_ENV` (`local` | `test` | `preprod` | `prod`) decides:
1. which `.env.<env>` file `scripts/env-loader.js` loads into `process.env` (only `REACT_APP_*`, `PORT`, `PUBLIC_URL`, `BUILD_OUT_DIR`; existing variables are not overwritten);
2. which `src/Config/config.<env>.js` `src/Config/config.js` exports (default `local`).

`vite.config.mjs` copies every `REACT_APP_*` variable into `process.env` for the client via `define` — so **every `REACT_APP_*` value is visible in the built JavaScript**. [V]

## 2. Environment variables (names only)

| Variable | Where set | Used by |
|---|---|---|
| `REACT_APP_ENV` | npm script (`cross-env`) and `.env.*` | `config.js`, env-loader |
| `REACT_APP_BASE_URL` | npm script | `vite.config.mjs` `base` (`/` local, `/CM-DashboardDP/` test/preprod/prod) |
| `REACT_APP_CMD_TOKEN_USERNAME`, `REACT_APP_CMD_TOKEN_PASSWORD` | `.env.*` | token call (`config.*.js` → `cmdGenerateToken`) |
| `REACT_APP_DEFAULT_PASSWORD` | `.env.*` | first-time registration gate |
| `REACT_APP_KODI_API_BASE_URL`, `REACT_APP_KAAMS_API_BASE_URL` | optional (shell or `.env.*`) | override API base URLs |
| `PORT` | npm script | dev server port (3000, `strictPort`) |
| `BUILD_OUT_DIR` | optional | build output folder (default `build`) |
| `GENERATE_SOURCEMAP` | npm script (`false` for test/preprod/prod) | source maps |

The `.env.*` files are gitignored; their values were moved out of the Angular source. Ask the team for them; never commit them.

## 3. Per-environment config (`src/Config/config.<env>.js`)

| Key | local | test | preprod | prod |
|---|---|---|---|---|
| `BASE_URL` | `/` | `/CM-DashboardDP/` | `/CM-DashboardDP/` | `/CM-DashboardDP/` |
| `kodiApiBaseUrl`, `kaamsApiBaseUrl` default | test API | test API | `''` | `''` |
| `inactivityTimeMs` | 1,800,000 | same | same | same |
| `enableConsoleLogs` | true | true | true | **false** |

## 4. npm scripts

| Script | What it runs |
|---|---|
| `start`, `start:local` | `REACT_APP_ENV=local REACT_APP_BASE_URL=/ PORT=3000` → env-loader → `vite` |
| `start:test` | test env, base `/CM-DashboardDP/` |
| `build` | env-loader → `vite build` |
| `build:local` / `build:test` / `build:preprod` / `build:prod` | sets env + base (+ `GENERATE_SOURCEMAP=false` except local) → `npm run build` |
| `preview` | `vite preview` |

Output: `build/` (`index.html`, `assets/*.js|css` hashed, plus `public/` files: `web.config`, `favicon.ico`, `assets/images/*`).

## 5. Testing

There is **no automated test suite** (no test runner in `package.json`; the reference project's tests were CRA defaults). Verification performed during the migration:

| Test | What | Result |
|---|---|---|
| BUILD | `npm run build:test` | passes; `build/index.html` references `/CM-DashboardDP/` [T] |
| UI-NOAPI | dev server with API base URLs pointed at a blocked local port; browser checks | login error path, guard alert/redirect, shell for USER and NODAL, Add Project validation, logout, nodal error state, User Management blank, request headers captured — all as expected [T] |
| RENDER | Project-detail components rendered with sample data in the browser (nothing saved, no API) | overview, header, State/District KPIs, Edit KPI modal, Webpage Output EN/KN render without errors; 31 district tiles [T] |
| API-RO | authorized read-only calls to the **test** API | token OK, 45 departments, designations for a department, search/empty/outside-click OK [T] |

Not tested: real login, registration, OTP, reset, project list with data, add/delete, save, status change, upload, all KPI writes, 401 path, 30-minute timeout, preprod/prod builds, mobile widths, side-by-side visual comparison with Angular. Parity status per requirement: [Angular docs 12](../../document/12_FUNCTIONAL_PARITY_CHECKLIST.md).

How to repeat the UI-NOAPI check (no backend traffic):

```bash
MSYS_NO_PATHCONV=1 REACT_APP_ENV=local REACT_APP_BASE_URL=/ PORT=3000 REACT_APP_KODI_API_BASE_URL=http://127.0.0.1:9 REACT_APP_KAAMS_API_BASE_URL=http://127.0.0.1:9 node scripts/env-loader.js "npx vite"
```

(`MSYS_NO_PATHCONV=1` is needed only in Git Bash; port 9 is refused by browsers, so every API call fails immediately.)

## 6. Deployment

| Item | Value |
|---|---|
| Server | IIS (from Angular); `public/web.config` rewrites non-file URLs to `index.html` |
| Path | `/CM-DashboardDP/` (built with `build:test` / `build:preprod` / `build:prod`) |
| Artifact | contents of `build/` |
| Routing | hash URLs, so the server never sees client routes |
| Runtime needs | browser access to the API host and to the CDNs (maxcdn, cdnjs, fonts.googleapis.com, fonts.gstatic.com) |
| prod/preprod API URL | **unknown** — set `REACT_APP_KODI_API_BASE_URL` / `REACT_APP_KAAMS_API_BASE_URL` in `.env.prod` / `.env.preprod`, or provide a same-host `/api` proxy [?] |

No CI/CD pipeline, Dockerfile or deploy script exists in this project. [V]

# 13 — Error Handling and Troubleshooting

Diagram: [flowcharts/09_error_handling.md](flowcharts/09_error_handling.md).

## 1. Error path

`axiosInstance` response interceptor (401 → `adminLogout`) → rejected promise → hook `try/catch` (or TanStack `query.error`) → `extractErrorMessage(err, fallback)` (`err.response.data.message` → string `err.response.data` → fallback) → inline message in the UI. 2xx responses with a non-success envelope show `res.message` or the fallback (Home list: silently empty). No retries, no timeouts, no global error boundary. [V]

## 2. Loading, empty and error states

| Screen | Loading | Empty | Error (+ Retry?) |
|---|---|---|---|
| Login – departments | "Loading departments..." in the dropdown, disabled | "No departments found" | "Unable to connect to the server. Please try again." / "Could not load departments. Please refresh and try again." (no retry — reload page) |
| Login – designations | "Loading designations..." | "No designations found" | "Could not load designations for this department." |
| Home | "Loading Projects…" (`LoadingMessage`) | "No projects yet for this department…" | "Could not load projects. Please try again." + Retry |
| Project detail | "Loading project…" | — | server message / "Project not found." / "Could not load project details. Please try again." + Retry |
| State KPIs | "Loading KPIs…" | "No State KPIs yet. Click Create KPI…" | "Could not load KPIs. Please try again." + Retry |
| District KPIs | "Loading district KPIs…" | "Create a State KPI first…" / "No district data available for this KPI yet." | "Could not load district KPIs…" + Retry |
| Nodal dashboard | "Loading dashboard…" | "No projects created under this department yet." / "No projects match your filters." | server message / "Could not load the dashboard. Please try again." + Retry |
| Lazy page chunk | `Loader` spinner | — | — |

Action errors appear as banners in the open modal, above the Overview sections, above the documents table, or per KPI row. [V]

## 3. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Dev server serves under `/Program Files/Git/` and assets 404 | Git Bash converted `REACT_APP_BASE_URL=/` into a Windows path | prefix the command with `MSYS_NO_PATHCONV=1`, or use `npm start` (npm scripts run through cmd) |
| Every API call fails with `ERR_UNSAFE_PORT` | `REACT_APP_*_API_BASE_URL` override left pointing at `127.0.0.1:9` | unset the override |
| Token / departments requests appear twice in dev | React `StrictMode` runs mount effects twice in development | expected; production builds call once |
| "Unable to connect to the server" on login | token call failed: wrong/missing `.env.<env>`, network, CORS, or base URL | check `.env.<env>` keys, network tab, `config.<env>.js` |
| Login works locally but not on preprod/prod | base URLs are empty in `config.preprod/prod.js` → calls go to `/api` on the app host | set the override variables or configure an `/api` proxy |
| Logged out unexpectedly | HTTP 401 on any call, 30-minute idle, or another tab logged out (localStorage cleared) | log in again |
| "Please Login" alert when opening a page | no `LOGIN_TOKEN` in this tab | log in; sessions are per tab |
| Page looks unstyled / icons missing | CDN blocked (Bootstrap 3.4.1, Font Awesome 4.7, Google Fonts) | allow the CDN hosts |
| Shell style leaks into a page | new shell element missing `{...S}`, or a new shell selector without `[data-shell]` | follow [10 §2](10_UI_STYLING_AND_CODING_STANDARDS.md) |
| Uploaded PDF not shown after reload | upload only stores the path; overview **Save** was not clicked | click Save after uploading |
| "The file uploaded, but no file path was found…" | upload response shape not recognised by `extractUploadedPath` | inspect the response (dev console via `devLog`) and confirm the shape with the backend |
| District values not reverted by Cancel | intended parity with Angular | reload the page or use State tab Cancel |
| No console logs in prod | `enableConsoleLogs: false` in `config.prod.js` | use test/local build to debug |

## 4. Debugging aids

- `devLog` (`src/Utils/apiHelpers.js`) logs requests/responses for project detail, KPIs, nodal list and login when `enableConsoleLogs` is true.
- Network tab: every request carries `Authorisation: bearer : …`; failed preflights usually mean CORS on the API host.
- Production builds have no source maps for test/preprod/prod (`GENERATE_SOURCEMAP=false`).

## 5. Known runtime behaviours

See [14](14_KNOWN_ISSUES_AND_OPEN_QUESTIONS.md) for behaviours kept on purpose from Angular (they look like bugs but are parity requirements).

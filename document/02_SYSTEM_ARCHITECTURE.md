# 02 — System Architecture

Diagram: [flowcharts/01_application_architecture.md](flowcharts/01_application_architecture.md).

## 1. Layers

```
Pages (screens)            src/Pages/*.js                 compose components, own UI-only state
  └─ Components            src/Components/**              presentational; receive a hook object or props
  └─ Hooks (logic)         src/Hooks/*.js                 state, validation, API orchestration, messages
       └─ Utils            src/Utils/*.js                 pure functions: mapping, payload builders, helpers
       └─ API services     src/API/cmdService.js          one function per backend endpoint
            └─ apiService  src/API/apiService.js          GET / POST / multipart wrappers
                 └─ axios  src/API/axiosInstance.js       interceptors (Authorisation header, 401 → logout)
Config                     src/Config/*.js                endpoint paths, base URLs, flags per environment
Cross-cutting              src/Routes/AuthContext.jsx, ProtectedRoute.jsx, src/Hooks/useInactivityTimer.js, src/Layout/*
```

Rule followed: **pages never call axios directly**; every request goes Hook → `cmdService` → `apiService` → `axiosInstance`. [V]

## 2. Provider tree (`src/App.js`)

```
<App>  (useInactivityTimer)
  QueryClientProvider (src/queryClient.js)
    HashRouter
      AuthProvider (src/Routes/AuthContext.jsx)
        LoaderProvider (src/Layout/LoaderContext.js)
          AppShell (src/Layout/AppShell.js)      navbar + sidebar when logged in
            AppRoutes (src/Routes/index.jsx)     Suspense + lazy pages
```

`AuthProvider` sits inside the router because logout navigates. [V]

## 3. Design patterns

| Pattern | Where | Notes |
|---|---|---|
| Custom hook per screen ("controller hook") | `useLoginLogic`, `useProjects`, `useProjectDetail`, `useStateKpis`, `useNodalList` | the hook returns one object; the page passes it to child components as a single prop (`login`, `detail`, `kpis`) |
| Service function per endpoint | `src/API/cmdService.js` | names mirror the Angular methods (`cmd_all_project_list` → `cmdAllProjectList`) |
| Endpoint map in config | `src/Config/apiEndPoints.js` | paths only; base URLs come from `config.<env>.js` |
| Environment config selection | `src/Config/config.js` | `switch (process.env.REACT_APP_ENV)`; default `local` |
| Pure model/mapper functions | `src/Utils/projectModel.js`, `nodalModel.js`, `projectDetailHelpers.js` | ported verbatim from Angular |
| Context for cross-cutting state | `AuthContext`, `LoaderContext` | no Redux |
| Server-state cache | TanStack Query for read-only lists | detail/KPI data use component state because it becomes editable form state |
| Lazy routes | `React.lazy` + one `Suspense` | one chunk per page |
| Scoped CSS without CSS-in-JS | `data-shell` attribute (shell) and page-root classes | see [10](10_UI_STYLING_AND_CODING_STANDARDS.md) |
| Variant prop instead of duplicate screens | `<ProjectDetail variant="user" \| "nodal">` | replaces two copied Angular components |

## 4. Runtime dependencies

| Package | Used in |
|---|---|
| react, react-dom | everywhere |
| react-router-dom | `App.js` (HashRouter), `Routes/*`, pages/hooks (`useNavigate`, `useParams`), `AppShell` (`NavLink`) |
| axios | `src/API/axiosInstance.js` |
| @tanstack/react-query | `queryClient.js`, `useProjects.js`, `useNodalList.js` |

Dev: vite, @vitejs/plugin-react, cross-env. External (CDN): Bootstrap 3.4.1 CSS, Font Awesome 4.7 CSS, Google Fonts. [V]

## 5. Backend

One REST/JSON backend, `CMDashboardAPI`, with two configured base URLs (`kodiApiBaseUrl` for 22 endpoints, `kaamsApiBaseUrl` for the token). Details: [06](06_API_AND_SERVICE_DOCUMENTATION.md).

## 6. Architecture decisions (approved during migration)

| # | Decision | Reason |
|---|---|---|
| A1 | `HashRouter` (reference project uses `BrowserRouter`) | keep Angular `#/` URLs and bookmarks |
| A2 | Bootstrap 3.4.1 CSS + Font Awesome 4.7 from CDN, no Bootstrap JS / jQuery | visual parity with Angular |
| A3 | Shell CSS: `data-shell` attribute on every shell element and every selector; page CSS prefixed with a page-root class; keyframes renamed per file | reproduces Angular's emulated encapsulation; stops generic shell selectors leaking |
| A4 | Navbar collapse and profile dropdown with React state | replaces Bootstrap JS |
| A5 | Profile re-read after login instead of Angular's forced one-time page reload | same visible result |
| A6 | Credentials and default password in `.env.*` (gitignored) | out of source control (still bundled into the client) |
| A7 | Custom table/sort/pagination on Nodal Dashboard | exact parity |
| A8 | User Management kept blank | parity until business decides |
| A9 | Dead Angular code not migrated (unused route, modals, libraries, `debugger`) | — |
| A10 | `devLog` — console logs off in `prod` | Angular logged full payloads |
| A11 | Optional `REACT_APP_KODI_API_BASE_URL` / `REACT_APP_KAAMS_API_BASE_URL` overrides | real prod URLs; blocked-API UI checks |
| A12 | One ProjectDetail page with `variant` | removes duplicated Angular component |

## 7. Not used although set up

`LoaderProvider` / `useLoader` (ref-counted global loader from the reference architecture) is mounted but **no screen calls `start_loader`/`stop_loader`**; screens show inline loaders like Angular. `Loader` is used only as the `Suspense` fallback. [V]

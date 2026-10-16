# 01 — Project Overview

## 1. Purpose

A data-entry portal for the Government of Karnataka's Chief Minister's "100-Days' Mission" dashboard (browser title "CM Dashboard Data Portal", `index.html`). It is a functional rewrite of the Angular application documented in [the Angular docs](../../document/00_PROJECT_OVERVIEW.md). [V]

| User (`localStorage.ROLE`) | Sidebar heading | Can do |
|---|---|---|
| `USER` — department posting | DEPARTMENT USER | list own projects, add/delete projects, edit project overview, upload milestone PDFs, maintain State/District KPIs, preview the public page |
| `NODAL` — nodal officer | CMO ADMIN | see all projects ("100-Days' Mission"), open any project detail, User Management (blank, as in Angular) |

## 2. Technology stack

| Concern | Choice | Version (package.json) |
|---|---|---|
| UI library | React (function components + hooks), JavaScript/JSX | react / react-dom ^19.2.1 |
| Build / dev server | Vite with @vitejs/plugin-react | vite ^6.4.3 (installed 6.4.4), plugin ^4.7.0 |
| Routing | react-router-dom **HashRouter** | ^6.30.2 |
| HTTP | axios (one instance with interceptors) | ^1.6.8 |
| Server state | @tanstack/react-query (list screens) | ^5.101.4 |
| Env injection | `scripts/env-loader.js` + `cross-env` | cross-env ^10.1.0 |
| CSS | Bootstrap **3.4.1** CSS, Font Awesome **4.7**, Google Fonts — from CDNs in `index.html`; per-screen CSS in `src/Styles/` | — |

No TypeScript, no Redux, no UI component library, no test runner. [V]

## 3. Entry points

| File | Role |
|---|---|
| `index.html` | page shell, CDN stylesheets, `<div id="root">`, loads `/src/index.js` |
| `src/index.js` | `createRoot(...).render(<React.StrictMode><App/></React.StrictMode>)` |
| `src/App.js` | starts the inactivity timer; provider tree `QueryClientProvider → HashRouter → AuthProvider → LoaderProvider → AppShell → AppRoutes` |
| `src/Routes/index.jsx` | route table (lazy pages) |
| `vite.config.mjs` | build config, `process.env` define, base path |
| `scripts/env-loader.js` | loads `.env.<REACT_APP_ENV>` then runs the given command |

## 4. Features

| # | Feature | Page | Main code |
|---|---|---|---|
| F1 | Login (returning user) | `#/` | `src/Hooks/useLoginLogic.js` `loginExisting` :346, `finalLogin` :273 |
| F2 | First-time registration (default password → OTP → password) | `#/` | `verifyDefaultPassword` :190, `sendOtp` :224, `verifyOtp` :249, `registerAndLogin` :314 |
| F3 | Reset password | `#/` | `openResetPassword` :364 … `submitResetPassword` :427 |
| F4 | Project list (card/table) | `#/home` | `src/Pages/Home.js`, `src/Hooks/useProjects.js` |
| F5 | Add project | Home modal | `src/Components/Home/AddProjectModal.js` |
| F6 | Delete project | Home modal | `src/Components/Home/DeleteProjectModal.js` |
| F7 | Project overview load/save | `#/project/:id` | `src/Hooks/useProjectDetail.js` `loadProject` :74, `saveAs` :294 |
| F8 | Change status | detail header | `applyChangeStatus` :354 |
| F9 | Milestone PDF upload/preview | Overview tab | `onDocSelected` :221, `openDocPreview` :278 |
| F10 | State KPIs | KPIs tab | `src/Hooks/useStateKpis.js` |
| F11 | District KPIs | KPIs → District | `useStateKpis.js` `loadDistrictData` :129, `saveDistrictKpis` :592 |
| F12 | Webpage Output preview | modal | `src/Components/ProjectDetail/WebpageOutputModal.js` |
| F13 | Nodal dashboard | `#/NodalDashboard` | `src/Pages/NodalDashboard.js`, `src/Hooks/useNodalList.js` |
| F14 | Nodal project detail | `#/NodalProjectDetailspage/:id` | `src/Pages/ProjectDetail.js` (`variant="nodal"`) |
| F15 | User Management (blank) | `#/NodalUsermgt` | `src/Pages/NodalUsermgt.js` |
| F16 | Logout, 401 logout, 30-min inactivity, route guard | shell | `src/Routes/AuthContext.jsx`, `src/API/axiosInstance.js`, `src/Hooks/useInactivityTimer.js`, `src/Routes/ProtectedRoute.jsx` |

Workflows: [11](11_BUSINESS_LOGIC_AND_WORKFLOWS.md).

## 5. Size

70 files under `src/` (3 API, 6 Config, 3 Routes, 3 Layout, 6 Hooks, 5 Pages, 29 Components, 6 Utils, 6 Styles, 3 root). Largest: `useStateKpis.js` (655 lines), `useLoginLogic.js` (474), `useProjectDetail.js` (442), `WebpageOutputModal.js` (356). [V]

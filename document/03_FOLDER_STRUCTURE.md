# 03 — Folder Structure

```
React Migration/
├─ index.html              page shell + CDN styles (Bootstrap 3.4.1, FA 4.7, Google Fonts)
├─ package.json            dependencies and npm scripts
├─ package-lock.json
├─ vite.config.mjs         base path, JSX in .js, process.env define, outDir, dev port 3000
├─ .env.local|test|preprod|prod   REACT_APP_* values per environment (gitignored, secrets)
├─ .gitignore              node_modules, build, dist, .env files
├─ scripts/
│  └─ env-loader.js        loads .env.<REACT_APP_ENV> into process.env, runs a command (masks *password*/*passphrase* in logs)
├─ public/                 copied as-is to the build root
│  ├─ web.config           IIS rewrite (from Angular)
│  ├─ favicon.ico
│  └─ assets/images/cmvv4.png, cmvv4-removebg-preview.png
├─ build/                  output of npm run build:* (gitignored)
├─ node_modules/
├─ document/               this documentation
└─ src/
   ├─ index.js             React root (StrictMode)
   ├─ App.js               provider tree + inactivity timer
   ├─ queryClient.js       TanStack Query defaults (no cache reuse, no retries)
   ├─ API/
   │  ├─ axiosInstance.js  axios instance, request/response interceptors, setUnauthorizedHandler
   │  ├─ apiService.js     getRequest / postRequest / postMultipart
   │  └─ cmdService.js     23 endpoint functions
   ├─ Config/
   │  ├─ apiEndPoints.js   23 endpoint paths
   │  ├─ config.js         picks config.<env>.js
   │  └─ config.local.js / config.test.js / config.preprod.js / config.prod.js
   ├─ Routes/
   │  ├─ index.jsx         route table (lazy pages)
   │  ├─ AuthContext.jsx   login flag, activateSideMenu, adminLogout, useAuth
   │  └─ ProtectedRoute.jsx  token + flag guard
   ├─ Layout/
   │  ├─ AppShell.js       navbar, profile dropdown, sidebar, content area
   │  ├─ LoaderContext.js  ref-counted loader context (mounted, unused by screens)
   │  └─ Loader.js         spinner used as Suspense fallback
   ├─ Hooks/
   │  ├─ useInactivityTimer.js
   │  ├─ useLoginLogic.js
   │  ├─ useProjects.js
   │  ├─ useProjectDetail.js
   │  ├─ useStateKpis.js
   │  └─ useNodalList.js
   ├─ Pages/
   │  ├─ Login.js
   │  ├─ Home.js
   │  ├─ ProjectDetail.js  (user + nodal variants)
   │  ├─ NodalDashboard.js
   │  └─ NodalUsermgt.js   (renders nothing)
   ├─ Components/
   │  ├─ Common/        CmsModal, SuccessModal, StateMessage (LoadingMessage, ErrorMessage), SearchableSelect
   │  ├─ Login/         LoginForm, ResetPasswordForm, DeptDesignationFields
   │  ├─ Home/          ProjectCard, ProjectTable, AddProjectModal, DeleteProjectModal
   │  ├─ Nodal/         NodalStatCards, NodalProjectsTable, Pagination
   │  └─ ProjectDetail/ DetailHeader, OverviewTab, IdentitySection, TopBoxesSection, LaunchDetailsSection,
   │                    MilestoneDocsSection, DocPreviewModal, KpisTab, StateKpiTable, DistrictKpiTable,
   │                    CreateKpiModal, EditKpiModal, DeleteKpiModal, WebpageOutputModal, outputLabels.js
   ├─ Utils/
   │  ├─ apiHelpers.js          extractErrorMessage, isSuccess, isOverviewSuccess, devLog
   │  ├─ cmdSession.js          getters for logged-in user values in storage
   │  ├─ projectModel.js        status meta, mappers, payload builders, KPI date helpers
   │  ├─ nodalModel.js          nodal mappers
   │  ├─ projectDetailHelpers.js  pick, aliases, KPI array extraction, image/data-URL, upload path, doc URL, file reader
   │  └─ karnatakaMapData.js    31 districts in 4 regions
   └─ Styles/
      ├─ AppShell.css           shell CSS, every selector requires [data-shell]
      ├─ Login.css              prefixed .page-login
      ├─ Home.css               prefixed .page-home
      ├─ ProjectDetail.css      prefixed .page-project-detail
      ├─ NodalDashboard.css     prefixed .page-nodal-dashboard
      └─ NodalUsermgt.css       prefixed .page-nodal-usermgt (screen renders nothing)
```

## Responsibilities by folder

| Folder | Put here | Do not put here |
|---|---|---|
| `API/` | HTTP calls and interceptors | business rules, UI messages |
| `Config/` | endpoint paths, base URLs, per-env flags | secrets (use `.env.*`) |
| `Routes/` | route table, auth context, guards | screen logic |
| `Layout/` | app chrome shared by all screens | screen content |
| `Hooks/` | screen state, validation, API sequencing, user messages | JSX |
| `Pages/` | route-level composition | API calls |
| `Components/` | JSX for parts of a screen | API calls (exception: Home's Add/Delete modals call their single service function directly) |
| `Utils/` | pure functions | React state |
| `Styles/` | CSS generated from the Angular CSS (scoped) | inline-only styles |

## CSS generation note

The CSS files in `src/Styles/` were generated from the Angular component CSS with a one-off converter script kept outside this project (in the migration session's scratch folder). To change styles, edit the files in `src/Styles/` directly and keep the scoping rules in [10](10_UI_STYLING_AND_CODING_STANDARDS.md).

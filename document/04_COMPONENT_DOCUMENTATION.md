# 04 — Component Documentation

Diagram: [flowcharts/06_component_relationships_and_state.md](flowcharts/06_component_relationships_and_state.md). All components are function components with default exports unless noted.

## 1. Pages

| Page | File | Route | Hooks used | Children |
|---|---|---|---|---|
| `Login` | `src/Pages/Login.js` | `/` | `useAuth`, `useLoginLogic(activateSideMenu)`; document click listener closes dropdowns when clicking outside `.page-login` | `LoginForm` or `ResetPasswordForm` (by `s.view`) |
| `Home` | `src/Pages/Home.js` | `/home` | `useProjects(postCode, deptName)`, `useNavigate`, local `viewMode`, `isAddModalOpen`, `projectToDelete` | `ProjectCard` × n or `ProjectTable`, `AddProjectModal`, `DeleteProjectModal`, `LoadingMessage`, `ErrorMessage` |
| `ProjectDetail` | `src/Pages/ProjectDetail.js` | `/project/:id` (`variant="user"`), `/NodalProjectDetailspage/:id` (`variant="nodal"`) | `useParams`, `useProjectDetail(id, variant)`, `useStateKpis(id, detail.postCode)`, local `selectedDistrict` | `DetailHeader`, `OverviewTab`, `KpisTab`, `CreateKpiModal`, `EditKpiModal`, `DeleteKpiModal`, 3 × `SuccessModal`, `WebpageOutputModal`, `DocPreviewModal` |
| `NodalDashboard` | `src/Pages/NodalDashboard.js` | `/NodalDashboard` | `useNodalList({screen:'dashboard', adminDeptCode:''})`; local search, filter, sort, page | `NodalStatCards`, `NodalProjectsTable`, `Pagination`, `LoadingMessage`, `ErrorMessage` |
| `NodalUsermgt` | `src/Pages/NodalUsermgt.js` | `/NodalUsermgt` | `useNodalList({screen:'usermgt', adminDeptCode: localStorage DEPT_CODE})` | none — returns `null` |

## 2. Layout and routing components

| Component | File | Props | Notes |
|---|---|---|---|
| `AppShell` | `src/Layout/AppShell.js` | `children` | reads profile from localStorage on every render; navbar collapse + profile dropdown state; outside click closes dropdown; `NavLink` sidebar; every element carries `data-shell` |
| `Loader` | `src/Layout/Loader.js` | — | spinner; Suspense fallback |
| `LoaderProvider` / `useLoader` | `src/Layout/LoaderContext.js` | `children` | provides `loading`, `start_loader`, `stop_loader` (unused by screens) |
| `AuthProvider` / `useAuth` | `src/Routes/AuthContext.jsx` | `children` | see [09](09_AUTHENTICATION_AND_SECURITY.md) |
| `ProtectedRoute` | `src/Routes/ProtectedRoute.jsx` | `element` | renders `element` or alerts and redirects |
| `AppRoutes` | `src/Routes/index.jsx` | — | route table |

## 3. Common components (`src/Components/Common/`)

| Component | Props | Behaviour |
|---|---|---|
| `CmsModal` | `onClose`, `className`, `children` | overlay `cms-modal-overlay` (click → `onClose`), inner `cms-modal` stops propagation |
| `SuccessModal` | `title`, `msg` (optional), `onOk` | green tick, title, optional message, OK |
| `LoadingMessage` (named) | `children` | `cms-state-msg` spinner + two line breaks + text |
| `ErrorMessage` (named) | `message`, `onRetry` | `cms-state-msg cms-state-error` + "Retry" |
| `SearchableSelect` | `open`, `disabled`, `loading`, `hasValue`, `displayText`, `onToggle`, `searchTerm`, `onSearchChange`, `searchPlaceholder`, `searchName`, `options`, `getKey`, `getLabel`, `isSelected`, `onSelect`, `emptyText` | Login's custom dropdown (`cmd-select` markup); parent owns open state |

## 4. Login components (`src/Components/Login/`) — all take `login` (the `useLoginLogic` object)

| Component | Renders |
|---|---|
| `DeptDesignationFields` | Department + Designation `SearchableSelect`s; prop `searchSuffix` ("R" in reset view) |
| `LoginForm` | "Department Login" view: new-user flow, returning-user flow, disabled Log In, Reset link, error/info boxes; `<form onSubmit={preventDefault}>` |
| `ResetPasswordForm` | "Reset Password" view: registered mobile, Send/Resend OTP, OTP verify, new passwords, Back to Login |

## 5. Home components (`src/Components/Home/`)

| Component | Props | Notes |
|---|---|---|
| `ProjectCard` | `c` (card VM), `totalKpiCount`, `onOpen(projectId)`, `onDelete(card, event)` | `--accent` CSS variable = status colour; hidden KPIs stat |
| `ProjectTable` | `projects`, `onOpen`, `onDelete` | row click opens; action cell stops propagation |
| `AddProjectModal` | `postCode`, `onClose`, `onAdded` | owns its form state; calls `cmdAddNewProject`; closes itself 1.5 s after success |
| `DeleteProjectModal` | `card`, `onClose`, `onDeleted(projectId)` | calls `cmdDeleteProject` |

## 6. Project detail components (`src/Components/ProjectDetail/`)

| Component | Props | Renders |
|---|---|---|
| `DetailHeader` | `detail` | org, title, tagline, status badge, Change Status select + Apply, View Webpage Output |
| `OverviewTab` | `detail` | save error banner, the 4 sections, Cancel/Save bar |
| `IdentitySection` | `detail` | names, subtitles, about texts, EN/KN banners, logo (hidden file inputs via refs) |
| `TopBoxesSection` | `detail` | repeatable boxes, + Add More |
| `LaunchDetailsSection` | `detail` | dates (`type="date"`), EN/KN targets |
| `MilestoneDocsSection` (+ internal `DocRow`) | `detail` | 5 document rows; each row has its own file input |
| `DocPreviewModal` | `label`, `url`, `onClose` | iframe |
| `KpisTab` | `kpis`, `isNodal` | State/District sub-tabs, Create KPI button |
| `StateKpiTable` | `kpis`, `isNodal` | KPI table, inline inputs, Cancel/Save; header "Value" or "Actual" (nodal) |
| `DistrictKpiTable` | `kpis` | KPI select, summary, editable values, Cancel/Save |
| `CreateKpiModal` | `kpis` | name, unit, year, quarter, target, actual, logo |
| `EditKpiModal` | `kpis` | name, unit, logo, quarter columns, add/remove column |
| `DeleteKpiModal` | `kpis` | confirm |
| `WebpageOutputModal` | `detail`, `kpis`, `selectedDistrict`, `setSelectedDistrict` | preview; own state: language, tile/table, docs flyout; helpers `splitLines`, `formatDisplayDate`, `isDistrictFilled`, `sortDistricts` |
| `outputLabels.js` | — | `OUTPUT_LABELS` EN/KN dictionary (named export) |

## 7. Nodal components (`src/Components/Nodal/`)

| Component | Props |
|---|---|
| `NodalStatCards` | `summary`, `draftProjectsCount`, `publishedProjectsCount` |
| `NodalProjectsTable` | `pagedProjects`, `sortBy(col)`, `sortIcon(col)`, `slNoFor(i)`, `openProject(id)` |
| `Pagination` | `pageStartIndex`, `pageEndIndex`, `total`, `currentPage`, `totalPages`, `pageNumbers`, `goToPage`, `prevPage`, `nextPage` |

## 8. Hooks

| Hook | File | Inputs | Returns (main members) |
|---|---|---|---|
| `useInactivityTimer` | `src/Hooks/useInactivityTimer.js` | — | nothing; side effect |
| `useLoginLogic` | `src/Hooks/useLoginLogic.js` | `activateSideMenu` | `s` (all state), `set`, `filteredDepartments`, `filteredDesignations`, `closeDropdowns`, `toggleDeptDropdown`, `selectDepartment`, `toggleDesigDropdown`, `selectDesignation`, `verifyDefaultPassword`, `sendOtp`, `verifyOtp`, `registerAndLogin`, `loginExisting`, `openResetPassword`, `backToLogin`, `sendResetOtp`, `verifyResetOtp`, `submitResetPassword`, `showpwd` |
| `useProjects` | `src/Hooks/useProjects.js` | `postCode`, `deptName` | `projects`, `totalKpiCount`, `loading`, `loadError`, `loadProjects`, `removeProjectLocally` |
| `useProjectDetail` | `src/Hooks/useProjectDetail.js` | `projectId`, `variant` | identity/boxes/launch/docs state + updaters, `loadProject`, `saveAs`, `applyChangeStatus`, upload/preview functions, success modal, webpage modal flags, `goHome`, `postCode`, `isNodal` |
| `useStateKpis` | `src/Hooks/useStateKpis.js` | `projectId`, `postCode` | KPI list/load/save, create/edit/delete modal state and actions, district state/actions, success modals |
| `useNodalList` | `src/Hooks/useNodalList.js` | `{ screen, adminDeptCode, mapRows, texts }` | `loading`, `loadError`, `summary`, `rows`, `load`, `dataUpdatedAt` |
| `useAuth` | `src/Routes/AuthContext.jsx` | — | `isLoginAuthenticated`, `setLoginAuthenticated`, `activateSideMenu`, `adminLogout` |
| `useLoader` | `src/Layout/LoaderContext.js` | — | `loading`, `start_loader`, `stop_loader` |

## 9. Relationships (who calls the API)

API calls originate only in hooks, plus `AddProjectModal` and `DeleteProjectModal` (each calls one service function). Components receive data and callbacks; they never import `axios` or `apiService`. [V]

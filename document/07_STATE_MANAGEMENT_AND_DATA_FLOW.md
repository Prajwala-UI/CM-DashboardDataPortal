# 07 — State Management and Data Flow

Diagram: [flowcharts/06_component_relationships_and_state.md](flowcharts/06_component_relationships_and_state.md).

## 1. Kinds of state

| Kind | Mechanism | Where |
|---|---|---|
| Logged-in flag | React context | `AuthContext.jsx` — `isLoginAuthenticated`, initialised from `sessionStorage.LOGIN_TOKEN != null` |
| Global loader (unused) | React context | `LoaderContext.js` |
| Read-only server lists | TanStack Query | `useProjects` key `['projects', postCode]`; `useNodalList` key `['nodalList', screen, adminDeptCode]` |
| Editable server data | `useState` in hooks | `useProjectDetail` (identity, boxes, launch, docs, status…), `useStateKpis` (KPI rows, modals, district) |
| Form state | `useState` | `useLoginLogic` (single object `s` + `set(patch)`), modals |
| UI-only state | `useState` in pages/components | view mode, open modals, search/sort/page, preview language |
| Session and profile | browser storage | see §3 |

No Redux/Zustand. [V]

## 2. TanStack Query configuration (`src/queryClient.js`)

`refetchOnWindowFocus: false`, `refetchOnMount: 'always'`, `staleTime: 0`, `retry: false` (queries and mutations). Effect: every screen visit refetches, like Angular; no silent retries. Hooks expose `loading = query.isFetching` so the loading message also shows on refetches (Angular behaviour). [V]

## 3. Browser storage (same keys as Angular)

| Key | Storage | Written | Read |
|---|---|---|---|
| `CMD_API_TOKEN` | session | `useLoginLogic.initCmdLogin` | — |
| `LOGIN_TOKEN` | session | `finalLogin` | interceptor, `getCmdToken`, `ProtectedRoute`, `AuthProvider` |
| `RESET_SUCCESS_FLASH` | session | `submitResetPassword` | login mount effect (then removed) |
| `PAGE_RELOADED` | session | not written in React (Angular reload workaround replaced) | removed by logout |
| `POST_CODE`, `REFERENCE_ID` | local | `finalLogin` | `getCmdPostCode` |
| `DEPT_CODE`, `DEPT_NAME` | local | `finalLogin` | `getCmdDeptCode`, `getCmdDeptName`, `NodalUsermgt` |
| `MOBILE_NO`, `LOCATION_CODE`, `LOCATION_NAME`, `LINE_DEPT_CODE`, `DESIGNATION_NAME` | local | `finalLogin` | `AppShell`, getters |
| `ROLE`, `IS_NODAL_OFFICER`, `NODAL_OFFICER_NAME` | local | `finalLogin` | `AppShell`, getters |
| `CMD_USER_DATA` | local | never written | fallback in getters |

Logout clears **both** storages entirely. Inactivity removes `LOGIN_TOKEN`, `REFERENCE_ID`, `myemail_id`. [V]

## 4. Data flow per screen

| Screen | Reads | Fetches | Writes |
|---|---|---|---|
| Login | user input | token, departments, designations, mobile-by-postcode | storage keys; navigates |
| Home | `POST_CODE`, `DEPT_NAME` (memoised once) | project list | add/delete via modals; `setQueryData` to drop a deleted card before refetch |
| Project detail | `:id`, `POST_CODE`, `DEPT_NAME` | detail ∥ KPIs, district fallback | save, status, upload, KPI create/edit/delete, district save |
| Nodal dashboard | — | nodal list (`admin_Dept_Code: ''`) | — |
| User Management | `DEPT_CODE` | nodal list | — |

## 5. Component communication

- One-way props. Pages create the hook object and pass it down whole (`login={login}`, `detail={detail}`, `kpis={kpis}`); children call its functions. [V]
- `useStateKpis(projectId, detail.postCode)` receives the **resolved project postCode** from `useProjectDetail`, so KPI saves use the same postCode as overview saves. [V]
- `selectedDistrict` for the preview lives in `ProjectDetail` so it survives closing/reopening the preview (Angular kept it on the component). [V]
- Modals are mounted only while open, so their local state resets on each open (Add Project, Webpage Output). [V]

## 6. Parity-specific data behaviour

| Behaviour | Implementation |
|---|---|
| District values come from the selected KPI row (`row.districts`) when present | `useStateKpis.js` `districtSource = 'embedded'`; `districtRows` derived from `stateKpis` |
| Editing district values edits the KPI row (so State bulk save re-sends them and District Cancel does not revert) | `updateDistrictValue` updates `stateKpis` immutably |
| API fallback district rows are separate | `districtApiRows` |
| State table edits change `row.data` entries | `updateKpiEntry(rowIndex, entryIndex, field, value)` |
| Edit KPI modal works on copies | `editKpiData` |
| Row `saveError` kept until list reload | `saveAllStateKpis` never clears it |
| `postCode` resolution chain | `useProjectDetail.loadProject` `setPostCode(prev => …)` |
| Nodal page resets to 1 after each successful load | `useEffect` on `dataUpdatedAt` in `NodalDashboard.js` |

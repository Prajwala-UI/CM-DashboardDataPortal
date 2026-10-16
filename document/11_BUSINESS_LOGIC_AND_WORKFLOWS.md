# 11 — Business Logic and Workflows

Diagrams: [flowcharts/08_business_workflows.md](flowcharts/08_business_workflows.md). Every rule here is ported from Angular; the Angular rule tables with original line numbers are in [06_BUSINESS_LOGIC_AND_VALIDATIONS.md](../../document/06_BUSINESS_LOGIC_AND_VALIDATIONS.md).

## 1. Business rules (React implementation)

| Rule | Implementation |
|---|---|
| New vs returning user: designation `mobile_No` matches `/^[6-9]\d{9}$/` | `useLoginLogic.js` `isValidMobile`, `applyLoginDesignation` :141 |
| Landing page by role (`NODAL` → `/NodalDashboard`, else `/home`) | `finalLogin` :273 |
| New project status `'Draft'` | `projectModel.buildAddProjectPayload` |
| Status badge colours and labels (Draft, Published, Pending Approval, Rejected, other) | `projectModel.getStatusMeta` :21 |
| Save keeps current status; only Change Status changes it | `OverviewTab` → `saveAs(status)` |
| Project postCode resolution chain (5 keys → projectId minus `_digits` → session) | `useProjectDetail.loadProject` :74 |
| Missing top-box ids back-filled `{projectId}_NN` | `saveAs` :294 |
| Dates: API → first 10 chars; save → `DD-MM-YYYY` or null | `loadProject`, `projectModel.toDdMmYyyy` |
| Literal `"string"` in binary fields = empty | `projectModel.cleanBinaryField` |
| KPI milestone date `"YYYY-YYYY, Qn Untill dd.mm.YYYY"` | `getKpiQuarterOptions`, `buildKpiMilestoneDate`, `parseKpiMilestoneDate` |
| New KPI target/value default `'0'` | `submitCreateKpi` :255 |
| District "filled" = non-empty and not `'0'`; Entered Total = numeric sum | `useStateKpis.loadDistrictData` :129, `WebpageOutputModal.isDistrictFilled` |
| Preview district grid = 31 known districts + unknown API districts, alphabetical | `WebpageOutputModal.sortDistricts` |
| Nodal draft/published counts from row status | `NodalDashboard.js` |
| Nodal list: filter, search (name/postcode/department), sort toggle, 10 per page, Sl.No continuous | `NodalDashboard.js` `filteredProjects`, `sortBy`, `slNoFor` |

## 2. Workflows

### W1 Login (returning user)
`Login` mount → token → departments → pick department (`selectDepartment` → designations) → pick designation (`selectDesignation`) → valid mobile ⇒ password field → **Log In** (`loginExisting` :346) → `finalLogin` → storage → `activateSideMenu` → navigate by role. Errors: see [08 §1](08_FORMS_AND_VALIDATIONS.md) and [13](13_ERROR_HANDLING_AND_TROUBLESHOOTING.md).

### W2 Registration (new user)
Designation without valid mobile ⇒ default password → **Verify** (`verifyDefaultPassword` :190, client-side) → mobile → **Verify with OTP** (`sendOtp` :224: `cmdSetMobilePassword` with empty password, then `doSendOtp`) → OTP → **Verify** (`verifyOtp` :249) → password + confirm → **Register & Log In** (`registerAndLogin` :314: `cmdSetMobilePassword` with password, then `finalLogin`).

### W3 Reset password
**Reset Password?** (`openResetPassword` :364) → (designation) → `fetchMobileForReset` → **Send OTP** (`sendResetOtp` :385) → **Verify OTP** (`verifyResetOtp` :406) → new passwords → **Reset Password** (`submitResetPassword` :427: `cmdSetMobilePassword`, flash message, `window.location.reload()`). **Back to Login** (`backToLogin` :377).

### W4 Project list
`Home` → `useProjects` query `cmdAllProjectList({postCode})` → non-success = empty list → cards/table → open `/project/:id`.

### W5 Add project
**Add Project** → `AddProjectModal` → validate names → `cmdAddNewProject(buildAddProjectPayload…)` → success banner, `onAdded` (refetch), close after 1.5 s.

### W6 Delete project
Trash → `DeleteProjectModal` → **Yes** → `cmdDeleteProject({projectId, isActive:false})` → `onDeleted`: close, `removeProjectLocally`, refetch.

### W7 Overview load/save
`ProjectDetail` → `useProjectDetail.loadProject` ∥ `useStateKpis.loadStateKpis` → edit → **Save** (`saveAs` :294) → `cmdUpdateProject` → `SuccessModal` "Project Details Updated" → **OK** (`closeSaveSuccessModal`) reloads. **Cancel** → `goHome`.

### W8 Change status
Select Draft/Published → **Apply** (`applyChangeStatus` :354) → `cmdChangeProjectStatus(withProjectIdAliases…)` → "Project Status Updated Successfully" → OK reloads.

### W9 Milestone documents
**Upload PDF / Replace** → `onDocSelected` :221 → PDF check → `cmdUploadMissionDocuments(FormData)` → `extractUploadedPath` → `docs[key] = path` → user must **Save** to persist. **View PDF** → `openDocPreview` → `DocPreviewModal`. **Remove** → local clear (Save to persist).

### W10 State KPIs
List (`loadStateKpis` :157) → inline Target/Value (`updateKpiEntry`) → **Save** (`saveAllStateKpis` :475, one `cmdUpdateStateKpi` per KPI via `Promise.all`) → all OK ⇒ "All KPI values saved successfully." / partial ⇒ "Could not save X of Y KPI(s). See the errors below." + row errors. **Create KPI** (`submitCreateKpi`), **Edit KPI** (`openEditKpiModal` :300 → columns → `removeEditKpiRow` :383 may call `cmdDeleteStateKpiTargetValue` → `submitEditKpi` :419), **Delete KPI** (`confirmDeleteKpi` :540; if selected, select first and `loadDistrictKpis`). Success popups reload on OK.

### W11 District KPIs
Select KPI (`onSelectedStateKpiChange` :579) → `loadDistrictData`: embedded rows or `loadDistrictKpis` (API) → edit (`updateDistrictValue`) → **Save** (`saveDistrictKpis` :592 → `cmdUpdateStateKpi`) → popup → OK reloads KPIs. **Cancel** (`cancelDistrictKpiEdits`) re-reads (embedded edits stay — Angular behaviour).

### W12 Webpage Output preview
**View Webpage Output** (`viewWebpageOutput` :406) → modal (EN, tile) + background `cmdOutputPage` (logged only) → language toggle, KPI selector, tile/table toggle, Mission Documents flyout → PDF preview.

### W13 Nodal dashboard
`NodalDashboard` → `useNodalList` (`admin_Dept_Code: ''`) → stat cards → filter/search/sort/paginate → row → `/NodalProjectDetailspage/:id` → W7–W12 with nodal differences (back to dashboard, postCode guards, "Actual" header).

### W14 User Management
`NodalUsermgt` → `useNodalList` (`admin_Dept_Code: DEPT_CODE`) → renders nothing (Angular template is empty).

### W15 Session end
Logout button / any 401 → `adminLogout`; 30-min idle → `useInactivityTimer` alert + reload; protected route without login → `ProtectedRoute` alert + redirect.

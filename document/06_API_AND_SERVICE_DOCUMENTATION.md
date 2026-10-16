# 06 — API and Service Documentation

Diagram: [flowcharts/05_api_request_response.md](flowcharts/05_api_request_response.md). Full JSON payload examples and backend unknowns are in the Angular docs: [05_API_DOCUMENTATION.md](../../document/05_API_DOCUMENTATION.md) — the React calls reproduce those contracts exactly.

## 1. Layers

| Layer | File | Responsibility |
|---|---|---|
| Endpoint paths | `src/Config/apiEndPoints.js` | 23 relative paths (`cmdToken` … `cmdListOfAllUsersAndProjectsList`) |
| Base URLs | `src/Config/config.<env>.js` | `kodiApiBaseUrl`, `kaamsApiBaseUrl` (+ token credentials and default password from env) |
| Service functions | `src/API/cmdService.js` | `kodiUrl(path)`, `kaamsUrl(path)`, `jsonAuthHeaders(token)`, one exported function per endpoint |
| Verb wrappers | `src/API/apiService.js` | `postRequest(url, data, headers)`, `getRequest(url, headers)` (sends `data: {}` so `Content-Type` survives), `postMultipart(url, formData, headers)`; all return `response.data` |
| Interceptors | `src/API/axiosInstance.js` | request: `Authorisation: bearer : <LOGIN_TOKEN>`; response: 401 → registered handler (`adminLogout`) |
| Response helpers | `src/Utils/apiHelpers.js` | `isSuccess`, `isOverviewSuccess`, `extractErrorMessage`, `devLog` |

The axios instance has **no `baseURL`** — URLs are built in `cmdService.js` because two base URLs exist. [V]

## 2. Base URLs per environment

| Env (`REACT_APP_ENV`) | `kodiApiBaseUrl` / `kaamsApiBaseUrl` default | Override |
|---|---|---|
| `local` (default) | `https://testapps.bbmpgov.in/CMDashboardAPI` | `REACT_APP_KODI_API_BASE_URL`, `REACT_APP_KAAMS_API_BASE_URL` |
| `test` | `https://testapps.bbmpgov.in/CMDashboardAPI` | same |
| `preprod` | `''` → relative `/api/...` on the app host **[?]** | same |
| `prod` | `''` → relative **[?]** | same |

Overrides use `??`, so an empty string override is respected. [V]

## 3. Headers

| Header | Value | Added by |
|---|---|---|
| `Authorisation` | `'bearer : ' + sessionStorage.LOGIN_TOKEN` (e.g. `bearer : null` before login) | request interceptor, every call |
| `Authorization` | `Bearer <token>` | `jsonAuthHeaders` (all except token) and multipart upload |
| `Content-Type` | `application/json` | `jsonAuthHeaders`; axios for the token call; **absent** for multipart (browser sets the boundary) |
| `Accept` | `application/json, text/plain, */*` | axios default |

`<token>` = `tokenRef.current` (from the token call) on the login page; `getCmdToken()` = `sessionStorage.LOGIN_TOKEN` elsewhere. [V] [T: UI-NOAPI — headers captured for token, GET departments, login, multipart upload]

## 4. Service functions (`src/API/cmdService.js`)

| Function (line) | HTTP | Path | Arguments → body | Called from |
|---|---|---|---|---|
| `cmdGenerateToken` (19) | POST (kaams) | `/api/Token` | `{ userName, password }` from `REACT_APP_CMD_TOKEN_USERNAME/PASSWORD` | `useLoginLogic.initCmdLogin` |
| `cmdGetMainDepartments` (26) | **GET** | `/api/EProcUser/main_departments` | — | `loadDepartments` |
| `cmdGetLineDepartments` (30) | POST | `/api/EProcUser/line_departments` | `{ location_Code }` | `selectDepartment` |
| `cmdSetMobilePassword` (34) | POST | `/api/EProcUser/insert_update_mobile_password` | `{ postCode, mobile_No, password }` | `sendOtp`, `registerAndLogin`, `submitResetPassword` |
| `cmdLogin` (38) | POST | `/api/EProcUser/login_username_password` | `{ mobile_No, password }` | `finalLogin` |
| `cmdSendOtp` (42) | POST | `/api/OTP/sendOTP` | `{ mobNo, variables: '' }` | `doSendOtp`, `sendResetOtp` |
| `cmdVerifyOtp` (46) | POST | `/api/OTP/validateOTP` | `{ mobNo, otp }` | `verifyOtp`, `verifyResetOtp` |
| `cmdGetMobileNoByPostcode` (50) | POST | `/api/EProcUser/Get_Mobile_By_PostCode` | `{ postCode }` | `fetchMobileForReset` |
| `cmdAllProjectList` (56) | POST | `/api/EProcUser/all_project_list` | `{ postCode }` | `useProjects` |
| `cmdAddNewProject` (60) | POST | `/api/EProcUser/add_project_name` | `buildAddProjectPayload(postCode, f)` | `AddProjectModal` |
| `cmdDeleteProject` (64) | POST | `/api/EProcUser/update-project-active` | `{ projectId, isActive: false }` | `DeleteProjectModal` |
| `cmdUpdateProject` (68) | POST | `/api/EProcUser/update_Submit_Project_Details` | `buildUpdateProjectPayload(...)` | `useProjectDetail.saveAs` |
| `cmdGetProjectDetail` (72) | POST | `/api/EProcUser/Get_Project_Details_by_Project_id` | `{ projectId }` | `loadProject` |
| `cmdUploadMissionDocuments` (76) | POST multipart | `/api/EProcUser/upload_mission_documents` | `FormData{ ProjectId, <PascalCase field>: file }` | `onDocSelected` |
| `cmdAddStateKpi` (82) | POST | `/api/EProcUser/add_state_KPI` | `buildAddStateKpiPayload` | `useStateKpis.submitCreateKpi` |
| `cmdGetStateKpis` (86) | POST | `/api/EProcUser/get_all_state_KPIs` | `{ projectId }` | `loadStateKpis` |
| `cmdUpdateStateKpi` (90) | POST | `/api/EProcUser/State_update_kpi` | `buildStateKpiUpdatePayload` | `submitEditKpi`, `saveAllStateKpis`, `saveDistrictKpis` |
| `cmdDeleteStateKpi` (94) | POST | `/api/EProcUser/update_kpi_active` | `{ kpi_id, isActive: false }` | `confirmDeleteKpi` |
| `cmdDeleteStateKpiTargetValue` (98) | POST | `/api/EProcUser/update_kpi_unit_target` | `buildDeleteKpiTargetValuePayload` | `removeEditKpiRow` |
| `cmdGetProjectKpiDistrict` (102) | POST | `/api/EProcUser/Get_Project_KPI_District` | `{ project_id, kpI_id }` | `loadDistrictKpis` |
| `cmdChangeProjectStatus` (106) | POST | `/api/EProcUser/change_project_status` | `withProjectIdAliases(id, { postCode, projectStatus })` | `applyChangeStatus` |
| `cmdOutputPage` (110) | POST | `/api/EProcUser/get_all_state_KPIs` (same as list KPIs) | `withProjectIdAliases(id, {})` | `viewWebpageOutput` (response only logged) |
| `cmdListOfAllUsersAndProjectsList` (114) | POST | `/api/EProcUser/State_department_projects` | `{ admin_Dept_Code }` | `useNodalList` |

The Angular method `cmd_Update_Project_KPI_District` was never called and is not ported. [V]

## 5. Payload builders (`src/Utils/projectModel.js`)

| Builder (line) | Casing notes |
|---|---|
| `buildAddProjectPayload` (118) | `projectStatus: 'Draft'`; `project_logo`, `banner_en`, `box_id`, `title_en`, `approval_Date`, `government_Orders_Notifications`, … |
| `buildUpdateProjectPayload` (157) | camelCase identity/boxes; `approval_Date` (DD-MM-YYYY or null), `physical_Target_kn`, snake-ish mission documents |
| `buildAddStateKpiPayload` (250) | `project_id`, `kpI_Name`, `kpI_logo`, `data:[{date,value,target}]` |
| `buildStateKpiUpdatePayload` (268) | `projectId`, `postCode`, `kpI_id`, `kpiName`, `unit`, `kpiLogo`, `data:[{id,date,value,target}]`, `districts:[{district,value,kpi}]` |
| `buildDeleteKpiTargetValuePayload` (291) | `projectId`, `kpI_id`, `id`, `isActive:false` |
| `nodalModel.buildNodalListPayload` (10) | built and logged only — **not sent** (as in Angular) |

Do not "clean up" these casings — the backend expects them exactly. [V]

## 6. Response handling

| Check | Function | Used by |
|---|---|---|
| `status_code == 200` or `status` "success" | `isSuccess` (`apiHelpers.js:16`) | Home list, add, delete |
| … or `status == 200` | `isOverviewSuccess` (:20), `isNodalListSuccess` (`nodalModel.js:24`) | detail, KPIs, nodal |
| `status === '1'` (string) | inline | send OTP |
| `status === 200` (number) | inline | verify OTP, login (+ `data`) |
| Error text | `extractErrorMessage(err, fallback)` (:4) | `err.response.data.message` → `err.response.data` (string) → fallback |

Response mapping helpers: `toProjectCardVM`, `toKpiRowVM`, `toDistrictKpiRows`, `toNodalSummaryVM`, `toNodalProjectRowVM`, `toNodalPostCodeRowVM`, `pick` (case-insensitive key lookup), `extractKpiArray` (14 candidate paths), `extractUploadedPath` (10 candidates). [V]

## 7. Interceptor behaviour

```js
// request  (axiosInstance.js)
config.headers['Authorisation'] = 'bearer : ' + sessionStorage.getItem('LOGIN_TOKEN');
// response
if (error.response && error.response.status === 401 && unauthorizedHandler) unauthorizedHandler();
return Promise.reject(error);
```

`setUnauthorizedHandler(adminLogout)` is registered by `AuthProvider` on mount. No retries, timeouts, or cancellation (same as Angular). TanStack Query is configured with `retry: false`. [V]

## 8. What has been exercised against a real API

Only, on the **test** server and with authorization: token, departments (45 returned), designations. [T: API-RO]. Every other function is implemented but untested against a real backend — see [12](12_CONFIGURATION_TESTING_AND_DEPLOYMENT.md).

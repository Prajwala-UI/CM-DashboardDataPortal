// cmdService.js
// One function per Angular APIServiceService method - same URLs, methods, bodies and headers.
import apiService from './apiService';
import config from '../Config/config';

const { credentials, endpoints } = config.ApiCredentials;

const kodiUrl = (path) => `${credentials.kodiApiBaseUrl}${path}`;
const kaamsUrl = (path) => `${credentials.kaamsApiBaseUrl}${path}`;

const jsonAuthHeaders = (myToken) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${myToken}`
});

/*------ Login APIs -------*/

// 1) Token generation (JSON body: userName / password)
export const cmdGenerateToken = () =>
  apiService.postRequest(kaamsUrl(endpoints.cmdToken), {
    userName: credentials.tokenUserName,
    password: credentials.tokenPassword
  });

// 2) Department dropdown
export const cmdGetMainDepartments = (myToken) =>
  apiService.getRequest(kodiUrl(endpoints.cmdMainDepartments), jsonAuthHeaders(myToken));

// 3) Designation dropdown
export const cmdGetLineDepartments = (location_Code, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdLineDepartments), { location_Code: location_Code }, jsonAuthHeaders(myToken));

// 4) Set / update mobile number + password (first-time user)
export const cmdSetMobilePassword = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdSetMobilePassword), data, jsonAuthHeaders(myToken));

// 5) Final login (mobile number + password)
export const cmdLogin = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdLogin), data, jsonAuthHeaders(myToken));

// 6) Send OTP (mobile number validation)
export const cmdSendOtp = (mobNo, variables = '', myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdSendOtp), { mobNo: mobNo, variables: variables }, jsonAuthHeaders(myToken));

// 7) Verify OTP
export const cmdVerifyOtp = (mobNo, otp, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdVerifyOtp), { mobNo: mobNo, otp: otp }, jsonAuthHeaders(myToken));

// 7.a) Get mobile no by postcode
export const cmdGetMobileNoByPostcode = (postCode, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdGetMobileNoByPostcode), { postCode: postCode }, jsonAuthHeaders(myToken));

/*------ After login -------*/

// 8) Projects Cards
export const cmdAllProjectList = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdAllProjectList), data, jsonAuthHeaders(myToken));

// 9) Add new project
export const cmdAddNewProject = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdAddNewProject), data, jsonAuthHeaders(myToken));

// 10) Delete project
export const cmdDeleteProject = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdDeleteProject), data, jsonAuthHeaders(myToken));

// 11) Edit project details
export const cmdUpdateProject = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdUpdateProject), data, jsonAuthHeaders(myToken));

// 12) Project detail (by project_id)
export const cmdGetProjectDetail = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdGetProjectDetail), data, jsonAuthHeaders(myToken));

// 12b) Upload a Milestone Document PDF (multipart/form-data) - Authorization only, no Content-Type
export const cmdUploadMissionDocuments = (formData, myToken) =>
  apiService.postMultipart(kodiUrl(endpoints.cmdUploadMissionDocuments), formData, {
    'Authorization': `Bearer ${myToken}`
  });

// 13) Create a new State KPI for a project
export const cmdAddStateKpi = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdAddStateKpi), data, jsonAuthHeaders(myToken));

// 14) List all State KPIs for a project
export const cmdGetStateKpis = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdGetStateKpis), data, jsonAuthHeaders(myToken));

// 15) Update one State KPI
export const cmdUpdateStateKpi = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdUpdateStateKpi), data, jsonAuthHeaders(myToken));

// 16) Delete one State KPI
export const cmdDeleteStateKpi = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdDeleteStateKpi), data, jsonAuthHeaders(myToken));

// 16 a) Delete state KPI target and value
export const cmdDeleteStateKpiTargetValue = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdDeleteStateKpiTargetValue), data, jsonAuthHeaders(myToken));

// 17) Get all district KPIs of a State KPI
export const cmdGetProjectKpiDistrict = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdGetProjectKpiDistrict), data, jsonAuthHeaders(myToken));

// 18) Change project status
export const cmdChangeProjectStatus = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdChangeProjectStatus), data, jsonAuthHeaders(myToken));

// 19) Output page (same URL as get_all_state_KPIs in the Angular source)
export const cmdOutputPage = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdOutputPage), data, jsonAuthHeaders(myToken));

// 20) Nodal officer - list of all users and projects
export const cmdListOfAllUsersAndProjectsList = (data, myToken) =>
  apiService.postRequest(kodiUrl(endpoints.cmdListOfAllUsersAndProjectsList), data, jsonAuthHeaders(myToken));

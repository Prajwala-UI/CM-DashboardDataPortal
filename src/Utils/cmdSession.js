/**
 * Helpers around the values the Login page stores in localStorage /
 * sessionStorage after a successful CM Dashboard login (Angular cmd-session.util.ts).
 */

function parseCmdUser() {
  try {
    return JSON.parse(localStorage.getItem('CMD_USER_DATA') || '{}') || {};
  } catch {
    return {};
  }
}

/** Bearer token used for all `cmd_*` project APIs. */
export function getCmdToken() {
  return sessionStorage.getItem('LOGIN_TOKEN');
}

/** Post code for the logged-in user's posting - key for all project APIs. */
export function getCmdPostCode() {
  const user = parseCmdUser();
  return (
    localStorage.getItem('POST_CODE') ||
    localStorage.getItem('REFERENCE_ID') ||
    user.postCode ||
    ''
  );
}

/** Human-readable department name, shown on the Home screen header and cards. */
export function getCmdDeptName() {
  const user = parseCmdUser();
  return localStorage.getItem('DEPT_NAME') || user.deptName || '';
}

/** Location code for the logged-in user's posting. */
export function getCmdLocationCode() {
  const user = parseCmdUser();
  return localStorage.getItem('LOCATION_CODE') || user.locationCode || '';
}

/** Human-readable location name (e.g. district/division). */
export function getCmdLocationName() {
  const user = parseCmdUser();
  return localStorage.getItem('LOCATION_NAME') || user.locationName || '';
}

/** Line department code for the logged-in user's posting. */
export function getCmdLineDeptCode() {
  const user = parseCmdUser();
  return localStorage.getItem('LINE_DEPT_CODE') || user.lineDeptCode || '';
}

/** Department code (distinct from postCode/lineDeptCode). */
export function getCmdDeptCode() {
  const user = parseCmdUser();
  return localStorage.getItem('DEPT_CODE') || user.deptCode || '';
}

/** Designation name (job title) for the logged-in user's posting. */
export function getCmdDesignationName() {
  const user = parseCmdUser();
  return localStorage.getItem('DESIGNATION_NAME') || user.designationName || '';
}

/** "NODAL" or "USER" - set at login, drives Nodal vs Dept navigation. */
export function getCmdRole() {
  return (localStorage.getItem('ROLE') || 'USER').toUpperCase();
}

/** true when the logged-in user is a Nodal Officer. */
export function getCmdIsNodalOfficer() {
  const raw = (localStorage.getItem('IS_NODAL_OFFICER') || 'false').toLowerCase();
  return raw === 'true';
}

/** Nodal Officer's own display name, if applicable. */
export function getCmdNodalOfficerName() {
  const user = parseCmdUser();
  return localStorage.getItem('NODAL_OFFICER_NAME') || user.nodalOfficerName || '';
}

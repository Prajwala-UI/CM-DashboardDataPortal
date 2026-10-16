/* Ported from Angular ADMIN_MODULES/nodal.model.ts (Nodal-only additions to project.model.ts).
   cmd_List_of_all_users_and_projects_list (State_department_projects) response:
   { status: 200, message: "success", admin_Dept_Code, admin_Dept_Name, total_PostCodes,
     registered_PostCodes, not_Registered_PostCodes, registered_PostCode_List, not_Registered_PostCode_List,
     active_Projects, inactive_Projects, total_Projects, projects: [...], data: [{ postCode, isRegistered, projectCount, projects }] } */
import { cleanBinaryField, getStatusMeta } from './projectModel';

/** Kept from the Angular source: built and logged by both Nodal screens, but NOT sent
 *  (the screens send { admin_Dept_Code } instead). */
export function buildNodalListPayload(f) {
  return {
    postCode: f.postCode,
    deptCode: f.deptCode,
    locationCode: f.locationCode,
    location_Code: f.locationCode,
    locationName: f.locationName,
    location_Name: f.locationName,
    lineDeptCode: f.lineDeptCode,
    line_Dept_Code: f.lineDeptCode
  };
}

/** Response envelope check - {status: 200, message: "success", ...}. */
export function isNodalListSuccess(res) {
  if (!res) {
    return false;
  }
  return String(res.status_code) === '200'
    || String(res.status).toLowerCase() === 'success'
    || String(res.status) === '200';
}

/* ---- Whole-response summary (drives the stat cards) ---- */
export function toNodalSummaryVM(res) {
  return {
    adminDeptCode: res.admin_Dept_Code || res.Admin_Dept_Code || '',
    adminDeptName: res.admin_Dept_Name || res.Admin_Dept_Name || '',
    totalPostCodes: Number(res.total_PostCodes || res.Total_PostCodes) || 0,
    registeredPostCodes: Number(res.registered_PostCodes || res.Registered_PostCodes) || 0,
    notRegisteredPostCodes: Number(res.not_Registered_PostCodes || res.Not_Registered_PostCodes) || 0,
    activeProjects: Number(res.active_Projects || res.Active_Projects) || 0,
    inactiveProjects: Number(res.inactive_Projects || res.Inactive_Projects) || 0,
    totalProjects: Number(res.total_Projects || res.Total_Projects) || 0
  };
}

/* ---- Project row (res.projects[]) - Project Dashboard ---- */
export function toNodalProjectRowVM(row) {
  return {
    projectId: row.project_id || '',
    postCode: row.postCode || '',
    adminDeptName: row.admin_dept_name || '',
    nameEn: row.project_name_en || '(Untitled project)',
    nameKn: row.project_name_kn || '',
    titleEn: row.title_en || '',
    titleKn: row.title_kn || '',
    logo: cleanBinaryField(row.project_logo),
    status: row.ProjectStatus || row.projectStatus || 'draft',
    statusMeta: getStatusMeta(row.ProjectStatus || row.projectStatus),
    physicalTarget: row.physical_target || '—',
    physicalTargetKn: row.physical_target_kn || '',
    financialTarget: row.financial_target || '—',
    financialTargetKn: row.financial_target_kn || '',
    isActive: row.IsActive !== false && row.isActive !== false
  };
}

/* ---- PostCode registry row (res.data[]) - User Management ---- */
export function toNodalPostCodeRowVM(row) {
  const projects = Array.isArray(row.Projects) ? row.Projects : (Array.isArray(row.projects) ? row.projects : []);

  return {
    postCode: row.postCode || '',
    isRegistered: row.IsRegistered === true || row.isRegistered === true,
    projectCount: Number(row.ProjectCount || row.projectCount) || 0,
    projects: projects.map((p) => ({
      projectId: p.project_id || p.projectId || '',
      nameEn: p.project_name_en || p.nameEn || '(Untitled project)',
      status: p.ProjectStatus || p.projectStatus || p.status || 'draft',
      statusMeta: getStatusMeta(p.ProjectStatus || p.projectStatus || p.status)
    }))
  };
}

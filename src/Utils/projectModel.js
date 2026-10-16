/* Ported from Angular ADMIN_MODULES/project.model.ts - logic kept verbatim (TypeScript types dropped). */

/** Some binary/base64 fields (project logo, banners, KPI logo) sometimes come back from the API as
 *  the literal string "string" (an unfilled Swagger placeholder). Treat that the same as "not uploaded". */
export function cleanBinaryField(val) {
  if (!val) {
    return '';
  }
  const v = val.toString().trim();
  if (!v || v.toLowerCase() === 'string') {
    return '';
  }
  return v;
}

/**
 * Status badge colours - shared between the project list cards and the detail header.
 * projectStatus is confirmed by the backend to accept exactly "draft" and "published";
 * matched case-insensitively, with defensive fallbacks for legacy values.
 */
export function getStatusMeta(status) {
  const s = (status || '').toString().trim().toUpperCase();

  if (s === 'D' || s === 'DRAFT') {
    return { label: 'Draft', bg: '#F1EFEA', color: '#6B7280' };
  }
  if (s === 'PUBLISHED' || s === 'A' || s === 'APPROVED' || s === 'APPROVAL') {
    return { label: 'Published', bg: '#E7F1E3', color: '#3F7D32' };
  }
  if (s === 'P' || s === 'PENDING' || s === 'PENDING_APPROVAL' || s === 'PENDINGAPPROVAL') {
    return { label: 'Pending Approval', bg: '#FCEFD8', color: '#C98A1A' };
  }
  if (s === 'R' || s === 'REJECTED') {
    return { label: 'Rejected', bg: '#FBE7E7', color: '#B84343' };
  }
  return { label: status || 'Draft', bg: '#EEF2F6', color: '#94A3B8' };
}

/* =======================================================
   Project Identity / Dashboard Top Boxes / Launch Details / Mission Documents
   ======================================================= */

export function blankIdentity() {
  return { nameEn: '', nameKn: '', taglineEn: '', taglineKn: '', aboutEn: '', aboutKn: '', projectLogo: '', bannerEn: '', bannerKn: '' };
}

export function blankTopBox() {
  return { boxId: '', titleEn: '', titleKn: '', valueEn: '', valueKn: '' };
}

export function blankLaunchDetails() {
  return { approvalDate: null, launchDate: null, physicalTarget: '', financialTarget: '', physicalTargetKn: '', financialTargetKn: '' };
}

/** Converts the <input type="date"> value (native "yyyy-MM-dd") to the "DD-MM-YYYY" format the
 *  update API expects. Returns null for an unset date, and passes unrecognized formats through unchanged. */
export function toDdMmYyyy(isoDate) {
  if (!isoDate) {
    return null;
  }
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

export function blankMissionDocuments() {
  return {
    governmentOrdersNotifications: '',
    missionGuidelinesFramework: '',
    missionPlanRoadmap: '',
    projectDPRDocuments: '',
    progressPerformanceReports: ''
  };
}

/** Row definitions for the Milestone Documents table. formField = exact multipart field name
 *  expected by upload_mission_documents (PascalCase). */
export const MISSION_DOC_DEFS = [
  { key: 'governmentOrdersNotifications', label: 'Government orders and Notifications', formField: 'GovernmentOrdersNotifications' },
  { key: 'missionGuidelinesFramework', label: 'Mission Guidelines and Framework', formField: 'MissionGuidelinesFramework' },
  { key: 'missionPlanRoadmap', label: 'Mission Plan Roadmap', formField: 'MissionPlanRoadmap' },
  { key: 'projectDPRDocuments', label: 'Project DPR Documents', formField: 'ProjectDPRDocuments' },
  { key: 'progressPerformanceReports', label: 'Progress and Performance Reports', formField: 'ProgressPerformanceReports' }
];

/* =======================================================
   Home screen - cmd_all_project_list
   ======================================================= */

/** One card on the Home screen, built from one item of cmd_all_project_list's `projects` array. */
export function toProjectCardVM(row, deptNameFallback) {
  const identity = row.projectIdentity;
  const launch = row.launchDetails;

  return {
    projectId: row.projectid,
    deptName: row.admin_Dept_Name || deptNameFallback,
    nameEn: (identity && identity.nameEn) || '(Untitled project)',
    taglineEn: (identity && identity.taglineEn) || '',
    status: row.projectStatus || 'draft',
    statusMeta: getStatusMeta(row.projectStatus),
    physicalTarget: (launch && launch.physicalTarget) || '—',
    financialTarget: (launch && launch.financialTarget) || '—',
    logo: cleanBinaryField(identity && identity.projectLogo),
    hasIdentity: !!identity,
    raw: row
  };
}

/* =======================================================
   9) Add Project - cmd_add_new_project (add_project_name)
   NOTE: this endpoint's nested objects use different key casing than the Get/Update endpoints -
   reproduced exactly as documented.
   ======================================================= */
export function buildAddProjectPayload(postCode, f) {
  return {
    postCode,
    projectStatus: 'Draft',
    projectIdentity: {
      nameEn: f.nameEn,
      nameKn: f.nameKn,
      taglineEn: f.taglineEn,
      taglineKn: f.taglineKn,
      project_logo: f.logoBase64 || '',
      aboutEn: '',
      aboutKn: '',
      banner_en: '',
      banner_kn: ''
    },
    dashboardTopBoxes: [
      { box_id: '', title_en: '', title_kn: '', value_en: '', value_kn: '' }
    ],
    launchDetails: {
      approval_Date: '',
      launch_Date: '',
      physical_Target: '',
      financial_Target: ''
    },
    missionDocuments: {
      government_Orders_Notifications: '',
      mission_Guidelines_Framework: '',
      mission_Plan_Roadmap: '',
      project_DPR_Documents: '',
      progress_Performance_Reports: ''
    }
  };
}

/* =======================================================
   11) Update Project Details (Overview tab) - cmd_update_project
   camelCase projectIdentity/dashboardTopBoxes; snake/mixed-case launchDetails/missionDocuments
   (confirmed against a real captured request in the Angular source).
   ======================================================= */
export function buildUpdateProjectPayload(f) {
  return {
    projectId: f.projectId,
    postCode: f.postCode,
    admin_Dept_Name: f.adminDeptName,
    projectStatus: f.projectStatus,
    isActive: f.isActive,
    projectIdentity: {
      nameEn: f.identity.nameEn,
      nameKn: f.identity.nameKn,
      taglineEn: f.identity.taglineEn,
      taglineKn: f.identity.taglineKn,
      projectLogo: f.identity.projectLogo || '',
      aboutEn: f.identity.aboutEn || '',
      aboutKn: f.identity.aboutKn || '',
      bannerEn: f.identity.bannerEn || '',
      bannerKn: f.identity.bannerKn || ''
    },
    dashboardTopBoxes: f.topBoxes.map(b => ({
      boxId: b.boxId || '',
      titleEn: b.titleEn || '',
      titleKn: b.titleKn || '',
      valueEn: b.valueEn || '',
      valueKn: b.valueKn || ''
    })),
    launchDetails: {
      approval_Date: toDdMmYyyy(f.launch.approvalDate),
      launch_Date: toDdMmYyyy(f.launch.launchDate),
      physical_Target: f.launch.physicalTarget || '',
      financial_Target: f.launch.financialTarget || '',
      physical_Target_kn: f.launch.physicalTargetKn || '',
      financial_Target_kn: f.launch.financialTargetKn || ''
    },
    missionDocuments: {
      government_Orders_Notifications: f.docs.governmentOrdersNotifications || '',
      mission_Guidelines_Framework: f.docs.missionGuidelinesFramework || '',
      mission_Plan_Roadmap: f.docs.missionPlanRoadmap || '',
      project_DPR_Documents: f.docs.projectDPRDocuments || '',
      progress_Performance_Reports: f.docs.progressPerformanceReports || ''
    }
  };
}

/* =======================================================
   State / District KPIs (Project Details -> KPIs tab)
   ======================================================= */

/** Build a KpiDataEntry[] ({ id, date, value, target }) from a KPI row's "data" array (however it's cased). */
export function toKpiDataEntries(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((d, i) => ({
      id: (d.id !== undefined && d.id !== null && d.id !== '') ? Number(d.id) : (d.Id !== undefined && d.Id !== null && d.Id !== '') ? Number(d.Id) : i,
      date: d.date || d.Date || '',
      value: d.value || d.Value || '',
      target: d.target || d.Target || ''
    }));
  }
  return [{ id: 0, date: '', value: '', target: '' }];
}

/** Build a KPI row view model from one item of cmd_get_state_kpis's data.projectKPIs array. */
export function toKpiRowVM(row) {
  const data = toKpiDataEntries(row.data || row.Data);
  const first = data[0];

  return {
    kpiId: row.kpI_id || row.KPI_id || row.state_KPI_ID || '',
    kpiName: row.kpI_Name || row.KPI_Name || '(Untitled KPI)',
    unit: row.unit || row.Unit || '',
    target: first.target || row.target || row.target_Value || '',
    value: first.value || row.value || '',
    data,
    status: row.kpi_status || 'D',
    statusMeta: getStatusMeta(row.kpi_status),
    logo: cleanBinaryField(row.kpI_logo || row.KPI_logo || row.kpi_logo || row.logo),
    deleting: false,
    saveError: '',
    districts: toDistrictKpiRows(row.districts || row.Districts)
  };
}

/** Build district rows ({ district, value }) from Get_Project_KPI_District's response.data. */
export function toDistrictKpiRows(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((row) => ({
    district: row.district || row.District || '',
    value: row.value || row.Value || ''
  }));
}

/** Build the cmd_add_state_kpi request body: { project_id, kpI_Name, unit, kpI_logo, data: [{ date, value, target }] }. */
export function buildAddStateKpiPayload(f) {
  return {
    project_id: f.projectId,
    kpI_Name: f.name,
    unit: f.unit,
    kpI_logo: f.logoBase64 || '',
    data: [
      {
        date: f.date || '',
        value: f.value || '',
        target: f.target || ''
      }
    ]
  };
}

/** Build the cmd_update_state_kpi request body:
 *  { projectId, postCode, kpI_id, kpiName, unit, kpiLogo, data: [{ id, date, value, target }], districts: [{ district, value, kpi }] }. */
export function buildStateKpiUpdatePayload(projectId, postCode, kpiId, kpiName, unit, kpiLogo, data, districts) {
  return {
    projectId,
    postCode,
    kpI_id: kpiId,
    kpiName,
    unit: unit || '',
    kpiLogo: kpiLogo || '',
    data: data.map(d => ({
      id: d.id,
      date: d.date || '',
      value: d.value || '',
      target: d.target || ''
    })),
    districts: districts.map(d => ({
      district: d.district,
      value: d.value || '',
      kpi: kpiName
    }))
  };
}

/** Build the cmd_delete_state_kpi_target_value request body: { projectId, kpI_id, id, isActive: false }. */
export function buildDeleteKpiTargetValuePayload(projectId, kpiId, dataId) {
  return {
    projectId,
    kpI_id: kpiId,
    id: dataId,
    isActive: false
  };
}

/** Common KPI units, offered as quick-pick suggestions. */
export const KPI_UNIT_OPTIONS = ['Count', '₹ Cr', '₹ Lakh', '%', 'Km', 'Kg', 'Litres', 'Date'];

/* ==================================================================
   KPI Milestone Delivery Date - "Year" + "Quarter" dropdowns, combined on submit
   e.g. "2026-2027, Q2 Untill 30.09.2026" - this combined string is sent as "date".
   ================================================================== */

/** Fiscal-year options offered in the "Year" dropdown. */
export const KPI_YEAR_OPTIONS = ['2026-2027', '2027-2028'];

/** Builds the 4 quarter-end labels for a given "YYYY-YYYY" fiscal year. */
export function getKpiQuarterOptions(yearRange) {
  const parts = (yearRange || '').split('-');
  const y1 = (parts[0] || '').trim();
  const y2 = (parts[1] || '').trim() || String(Number(y1) + 1);

  if (!y1 || !/^\d{4}$/.test(y1)) {
    return [];
  }

  return [
    `Q1 Untill 30.06.${y1}`,
    `Q2 Untill 30.09.${y1}`,
    `Q3 Untill 31.12.${y1}`,
    `Q4 Untill 31.03.${y2}`
  ];
}

/** Combines a selected Year + Quarter into the single "date" string. Returns '' unless both are set. */
export function buildKpiMilestoneDate(year, quarter) {
  if (!year || !quarter) {
    return '';
  }
  return `${year}, ${quarter}`;
}

/** Reverses buildKpiMilestoneDate. Returns null for anything that doesn't match the
 *  "YYYY-YYYY, Qn Untill dd.mm.YYYY" shape. */
export function parseKpiMilestoneDate(dateStr) {
  if (!dateStr) {
    return null;
  }

  const commaIdx = dateStr.indexOf(',');
  if (commaIdx === -1) {
    return null;
  }

  const year = dateStr.substring(0, commaIdx).trim();
  const quarter = dateStr.substring(commaIdx + 1).trim();

  if (!/^\d{4}-\d{4}$/.test(year)) {
    return null;
  }

  const validQuarters = getKpiQuarterOptions(year);
  if (!validQuarters.includes(quarter)) {
    return null;
  }

  return { year, quarter };
}

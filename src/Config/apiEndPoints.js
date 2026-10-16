//apiEndPoints.js
// Paths copied verbatim from the Angular APIServiceService (apiservice.service.ts).
// `cmdToken` is served from kaamsApiBaseUrl, every other path from kodiApiBaseUrl.
const apiEndpoints = {
        // OTP (mobile verification)
        cmdSendOtp: '/api/OTP/sendOTP',
        cmdVerifyOtp: '/api/OTP/validateOTP',

        // Login page
        cmdToken: '/api/Token',
        cmdMainDepartments: '/api/EProcUser/main_departments',
        cmdLineDepartments: '/api/EProcUser/line_departments',
        cmdSetMobilePassword: '/api/EProcUser/insert_update_mobile_password',
        cmdLogin: '/api/EProcUser/login_username_password',
        cmdGetMobileNoByPostcode: '/api/EProcUser/Get_Mobile_By_PostCode',

        // Home page
        cmdAllProjectList: '/api/EProcUser/all_project_list',
        cmdAddNewProject: '/api/EProcUser/add_project_name',
        cmdDeleteProject: '/api/EProcUser/update-project-active',
        cmdUpdateProject: '/api/EProcUser/update_Submit_Project_Details',
        cmdGetProjectDetail: '/api/EProcUser/Get_Project_Details_by_Project_id',
        cmdUploadMissionDocuments: '/api/EProcUser/upload_mission_documents',

        // Project Details - State KPIs
        cmdAddStateKpi: '/api/EProcUser/add_state_KPI',
        cmdGetStateKpis: '/api/EProcUser/get_all_state_KPIs',
        cmdUpdateStateKpi: '/api/EProcUser/State_update_kpi',
        cmdDeleteStateKpi: '/api/EProcUser/update_kpi_active',
        cmdDeleteStateKpiTargetValue: '/api/EProcUser/update_kpi_unit_target',

        // Project Details - District KPIs
        cmdGetProjectKpiDistrict: '/api/EProcUser/Get_Project_KPI_District',

        // Change Project Status and View Output Page
        cmdChangeProjectStatus: '/api/EProcUser/change_project_status',
        cmdOutputPage: '/api/EProcUser/get_all_state_KPIs',

        // Nodal officer
        cmdListOfAllUsersAndProjectsList: '/api/EProcUser/State_department_projects'
};

export { apiEndpoints };

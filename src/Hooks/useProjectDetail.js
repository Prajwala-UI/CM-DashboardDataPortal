import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    cmdGetProjectDetail, cmdUpdateProject, cmdChangeProjectStatus, cmdOutputPage, cmdUploadMissionDocuments
} from '../API/cmdService';
import {
    blankIdentity, blankTopBox, blankLaunchDetails, blankMissionDocuments, MISSION_DOC_DEFS,
    getStatusMeta, buildUpdateProjectPayload
} from '../Utils/projectModel';
import {
    pick, describeRaw, withProjectIdAliases, extractUploadedPath, resolveDocUrl, toImageDataUrl, readFileAsBase64
} from '../Utils/projectDetailHelpers';
import { getCmdToken, getCmdPostCode, getCmdDeptName } from '../Utils/cmdSession';
import { extractErrorMessage, isOverviewSuccess, devLog } from '../Utils/apiHelpers';

/**
 * Overview side of the Angular ProjectDetailComponent / NodalProjectDetailspageComponent:
 * load (12), save (11), change status, banners/logo, top boxes, launch details, milestone PDF uploads,
 * PDF preview and the success popup. variant "nodal" adds the postCode guards and returns to NodalDashboard.
 */
export const useProjectDetail = (projectId, variant) => {
    const navigate = useNavigate();
    const isNodal = variant === 'nodal';

    const deptName = useMemo(() => getCmdDeptName(), []);
    const [postCode, setPostCode] = useState(() => getCmdPostCode());
    const [adminDeptName, setAdminDeptName] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    const [status, setStatus] = useState('draft');
    const statusMeta = getStatusMeta(status);

    const [identity, setIdentity] = useState(blankIdentity());
    // No fixed dimension requirement for banner images - any size is accepted.
    const [bannerError, setBannerError] = useState('');
    const [topBoxes, setTopBoxes] = useState([blankTopBox()]);
    const [launch, setLaunch] = useState(blankLaunchDetails());
    const [docs, setDocs] = useState(blankMissionDocuments());

    // Overview / KPIs tabs
    const [activeTab, setActiveTab] = useState('overview');

    // Save (cmd_update_project)
    const [saving, setSaving] = useState(false);
    const [savingAction, setSavingAction] = useState(null);
    const [saveError, setSaveError] = useState('');

    // "Change Status" dropdown in the header bar
    const [changeStatusValue, setChangeStatusValue] = useState('');

    // Save confirmation popup
    const [saveSuccess, setSaveSuccess] = useState({ open: false, title: 'Project Details Updated', msg: '' });

    // PDF document upload / preview (Milestone Documents)
    const [docUploadError, setDocUploadError] = useState('');
    const [docUploading, setDocUploading] = useState({});
    const [docPreview, setDocPreview] = useState({ open: false, label: '', url: null });

    // Webpage Output modal
    const [isWebpageOutputModalOpen, setIsWebpageOutputModalOpen] = useState(false);

    /** Milestone Documents rows resolved to their current value. */
    const missionDocRows = useMemo(
        () => MISSION_DOC_DEFS.map(def => ({ key: def.key, label: def.label, value: docs[def.key] || '' })),
        [docs]
    );

    /* ==================================================================
       12) cmd_get_project_detail   BODY: { projectId }
       ================================================================== */
    const loadProject = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        const body = { projectId };
        devLog('[ProjectDetail] cmd_get_project_detail request ->', body);

        try {
            const res = await cmdGetProjectDetail(body, getCmdToken());
            setLoading(false);
            devLog('[ProjectDetail] cmd_get_project_detail response <-', res);

            if (res && isOverviewSuccess(res)) {
                const p = res.project || {};
                setAdminDeptName(p.admin_Dept_Name || deptName);
                setIsActive(p.isActive !== false);
                const st = p.projectStatus || 'draft';
                setStatus(st);
                setChangeStatusValue(st);

                /* IMPORTANT: capture the project's OWN postCode - the update endpoint validates it against
                   the project being updated (a nodal officer opens projects of other postCodes). Try every
                   key casing, then derive it from the projectId ("<postCode>_<seq>"), then the session value. */
                setPostCode(prev => {
                    const resolved =
                        p.postCode ||
                        p.PostCode ||
                        p.post_Code ||
                        p.projectPostCode ||
                        p.ProjectPostCode ||
                        (projectId ? projectId.replace(/_\d+$/, '') : '') ||
                        prev;   // final fallback to the session value
                    devLog('[ProjectDetail] project postCode resolved ->', resolved);
                    return resolved;
                });

                const idn = res.projectIdentity || {};
                const newIdentity = {
                    nameEn: idn.nameEn || '',
                    nameKn: idn.nameKn || '',
                    taglineEn: idn.taglineEn || '',
                    taglineKn: idn.taglineKn || '',
                    aboutEn: idn.aboutEn || '',
                    aboutKn: idn.aboutKn || '',
                    projectLogo: pick(idn, ['projectLogo', 'project_logo']),
                    bannerEn: pick(idn, ['bannerEn', 'banner_en', 'banner_En']),
                    bannerKn: pick(idn, ['bannerKn', 'banner_kn', 'banner_Kn'])
                };
                setIdentity(newIdentity);

                devLog('[ProjectDetail] projectIdentity raw keys from API:', Object.keys(idn));
                devLog('[ProjectDetail] raw banner/logo fields (type + first 40 chars):', {
                    projectLogo: describeRaw(idn.projectLogo),
                    bannerEn: describeRaw(idn.bannerEn),
                    bannerKn: describeRaw(idn.bannerKn)
                });

                const boxes = Array.isArray(res.dashboardTopBoxes) ? res.dashboardTopBoxes : [];
                setTopBoxes(boxes.length
                    ? boxes.map((b) => ({ boxId: b.boxId || '', titleEn: b.titleEn || '', titleKn: b.titleKn || '', valueEn: b.valueEn || '', valueKn: b.valueKn || '' }))
                    : [blankTopBox()]);

                const ld = res.launchDetails || {};
                setLaunch({
                    approvalDate: ld.approvalDate ? String(ld.approvalDate).substring(0, 10) : null,
                    launchDate: ld.launchDate ? String(ld.launchDate).substring(0, 10) : null,
                    physicalTarget: ld.physicalTarget || '',
                    financialTarget: ld.financialTarget || '',
                    physicalTargetKn: pick(ld, ['physicalTargetKn', 'physical_Target_kn', 'physical_target_kn']),
                    financialTargetKn: pick(ld, ['financialTargetKn', 'financial_Target_kn', 'financial_target_kn'])
                });

                const md = res.missionDocuments || {};
                setDocs({
                    governmentOrdersNotifications: pick(md, ['governmentOrdersNotifications', 'government_Orders_Notifications']),
                    missionGuidelinesFramework: pick(md, ['missionGuidelinesFramework', 'mission_Guidelines_Framework']),
                    missionPlanRoadmap: pick(md, ['missionPlanRoadmap', 'mission_Plan_Roadmap']),
                    projectDPRDocuments: pick(md, ['projectDPRDocuments', 'project_DPR_Documents']),
                    progressPerformanceReports: pick(md, ['progressPerformanceReports', 'progress_Performance_Reports'])
                });
            } else {
                setLoadError((res && res.message) ? res.message : 'Project not found.');
            }
        } catch (err) {
            setLoading(false);
            setLoadError(extractErrorMessage(err, 'Could not load project details. Please try again.'));
        }
    }, [projectId, deptName]);

    useEffect(() => {
        if (!projectId) {
            setLoadError('No project selected.');
            return;
        }
        loadProject();
    }, [projectId, loadProject]);

    const goHome = () => navigate(isNodal ? '/NodalDashboard' : '/home');

    /* ---- Dashboard Top Boxes - "+ Add More" ---- */
    const addTopBox = () => setTopBoxes(prev => [...prev, blankTopBox()]);
    const removeTopBox = (index) => setTopBoxes(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    const updateTopBox = (index, field, value) => setTopBoxes(prev => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));

    const updateIdentity = (field, value) => setIdentity(prev => ({ ...prev, [field]: value }));
    const updateLaunch = (field, value) => setLaunch(prev => ({ ...prev, [field]: value }));

    /* ---- Project Identity - logo / banner uploads (stored as base64 images) ---- */
    const onLogoSelected = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        readFileAsBase64(file, (base64) => updateIdentity('projectLogo', base64));
        input.value = '';
    };

    const clearLogo = () => updateIdentity('projectLogo', '');

    const onBannerSelected = (which, event) => {
        setBannerError('');

        const input = event.target;
        const file = input.files && input.files[0];
        input.value = '';

        if (!file) {
            return;
        }

        readFileAsBase64(
            file,
            (base64) => updateIdentity(which === 'en' ? 'bannerEn' : 'bannerKn', base64),
            () => setBannerError('Could not read the selected file. Please try again.')
        );
    };

    const clearBanner = (which) => {
        setBannerError('');
        updateIdentity(which === 'en' ? 'bannerEn' : 'bannerKn', '');
    };

    const logoDataUrl = () => toImageDataUrl(identity.projectLogo, 'logo');
    const bannerDataUrl = (which) => toImageDataUrl(which === 'en' ? identity.bannerEn : identity.bannerKn, `banner(${which})`);

    /* ---- Milestone Documents - each PDF uploads immediately (multipart, one file per call) ---- */
    const onDocSelected = async (key, event) => {
        setDocUploadError('');

        const input = event.target;
        const file = input.files && input.files[0];
        input.value = '';

        devLog('[ProjectDetail] onDocSelected', key, file ? { name: file.name, type: file.type, size: file.size } : '(no file)');

        if (!file) {
            return;
        }

        // Some file pickers don't report "application/pdf" reliably - fall back to the extension.
        const looksLikePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!looksLikePdf) {
            devLog('[ProjectDetail] onDocSelected rejected - not recognized as a PDF', key, file.type, file.name);
            setDocUploadError('Please choose a PDF file.');
            return;
        }

        const def = MISSION_DOC_DEFS.find(d => d.key === key);
        if (!def) {
            return;
        }

        setDocUploading(prev => ({ ...prev, [key]: true }));

        const formData = new FormData();
        formData.append('ProjectId', projectId);
        formData.append(def.formField, file, file.name);

        devLog('[ProjectDetail] cmd_upload_mission_documents request ->', { ProjectId: projectId, field: def.formField, fileName: file.name });

        try {
            const res = await cmdUploadMissionDocuments(formData, getCmdToken());
            setDocUploading(prev => ({ ...prev, [key]: false }));
            devLog('[ProjectDetail] cmd_upload_mission_documents response <-', res);

            const path = extractUploadedPath(res, def);

            if (path) {
                setDocs(prev => ({ ...prev, [key]: path }));
            } else {
                devLog('[ProjectDetail] cmd_upload_mission_documents - could not find a path in the response for', def.formField);
                setDocUploadError('The file uploaded, but no file path was found in the response - see console for the raw response.');
            }
        } catch (err) {
            setDocUploading(prev => ({ ...prev, [key]: false }));
            devLog('[ProjectDetail] cmd_upload_mission_documents error <-', err);
            setDocUploadError(extractErrorMessage(err, 'Could not upload this document. Please try again.'));
        }
    };

    const removeDoc = (key) => setDocs(prev => ({ ...prev, [key]: '' }));

    const openDocPreview = (key, label) => {
        const value = docs[key];
        if (!value) {
            return;
        }
        const url = resolveDocUrl(value);
        devLog('[ProjectDetail] openDocPreview', key, 'raw value ->', value, '- resolved url ->', url);
        setDocPreview({ open: true, label, url });
    };

    const closeDocumentPreview = () => setDocPreview({ open: false, label: '', url: null });

    /* ==================================================================
       11) cmd_update_project - Save changes (re-sends the current status; only the
       "Change Status" + Apply button changes it).
       ================================================================== */
    const saveAs = async (statusToSend, uiAction = 'Save') => {
        setSaveError('');

        if (!identity.nameEn.trim() || !identity.nameKn.trim()) {
            setSaveError('Please enter the project name in both English and Kannada.');
            return;
        }

        /* Nodal screen guard: the update endpoint requires a valid project postCode. */
        if (isNodal && !postCode) {
            setSaveError('This project has no PostCode on record, so it cannot be saved. Please contact the administrator.');
            return;
        }

        setSaving(true);
        setSavingAction(uiAction);

        // dashboardTopBoxes require a non-empty boxId - back-fill boxes added in this session
        // (same naming pattern the API uses, e.g. "BMSCE_PCPL_BNG_008_01").
        const boxes = topBoxes.map((box, i) => (box.boxId ? box : { ...box, boxId: `${projectId}_${String(i + 1).padStart(2, '0')}` }));
        setTopBoxes(boxes);

        const payload = buildUpdateProjectPayload({
            projectId,
            postCode,
            adminDeptName: adminDeptName || deptName,
            projectStatus: statusToSend,
            isActive,
            identity,
            topBoxes: boxes,
            launch,
            docs
        });

        devLog('[ProjectDetail] cmd_update_project request ->', payload);

        try {
            const res = await cmdUpdateProject(payload, getCmdToken());
            setSaving(false);
            setSavingAction(null);
            devLog('[ProjectDetail] cmd_update_project response <-', res);

            if (res && isOverviewSuccess(res)) {
                const st = res.projectStatus || statusToSend;
                setStatus(st);
                setChangeStatusValue(st);
                setSaveSuccess({ open: true, title: 'Project Details Updated', msg: res.message || 'Project details updated successfully.' });
            } else {
                setSaveError((res && res.message) ? res.message : 'Could not save changes. Please try again.');
            }
        } catch (err) {
            setSaving(false);
            setSavingAction(null);
            devLog('[ProjectDetail] cmd_update_project error <-', err);
            setSaveError(extractErrorMessage(err, 'Could not save changes. Please try again.'));
        }
    };

    /** "Change Status" dropdown + Apply - dedicated Change_Project_Status endpoint
     *  (request shape unconfirmed in the Angular source; reproduced exactly). */
    const applyChangeStatus = async () => {
        if (!changeStatusValue || changeStatusValue === status) {
            return;
        }

        setSaveError('');

        if (isNodal && !postCode) {
            setSaveError('This project has no PostCode on record, so its status cannot be changed. Please contact the administrator.');
            return;
        }

        setSaving(true);
        setSavingAction('ChangeStatus');

        const payload = withProjectIdAliases(projectId, {
            postCode,
            projectStatus: changeStatusValue
        });

        devLog('[ProjectDetail] cmd_Change_Project_Status request ->', payload);

        try {
            const res = await cmdChangeProjectStatus(payload, getCmdToken());
            setSaving(false);
            setSavingAction(null);
            devLog('[ProjectDetail] cmd_Change_Project_Status response <-', res);

            if (res && isOverviewSuccess(res)) {
                const st = res.projectStatus || changeStatusValue;
                setStatus(st);
                setChangeStatusValue(st);
                setSaveSuccess({ open: true, title: 'Project Status Updated Successfully', msg: res.message || 'Project status updated successfully.' });
            } else {
                setSaveError((res && res.message) ? res.message : 'Could not change the project status. Please try again.');
            }
        } catch (err) {
            setSaving(false);
            setSavingAction(null);
            devLog('[ProjectDetail] cmd_Change_Project_Status error <-', err);
            setSaveError(extractErrorMessage(err, 'Could not change the project status. Please try again.'));
        }
    };

    /** "OK" on the success pop-up - stays on this project and reloads the latest saved data. */
    const closeSaveSuccessModal = () => {
        setSaveSuccess(prev => ({ ...prev, open: false }));
        loadProject();
    };

    /** "View Webpage Output" - opens the in-app preview modal and fires the Output Page endpoint
     *  in the background purely for logging (same URL as get_all_state_KPIs in the Angular source). */
    const viewWebpageOutput = () => {
        if (!projectId) {
            return;
        }

        setIsWebpageOutputModalOpen(true);

        devLog('[ProjectDetail] viewWebpageOutput opened - banner/logo state ->', {
            bannerEnLength: identity.bannerEn ? identity.bannerEn.length : 0,
            bannerKnLength: identity.bannerKn ? identity.bannerKn.length : 0,
            projectLogoLength: identity.projectLogo ? identity.projectLogo.length : 0
        });

        const payload = withProjectIdAliases(projectId, {});
        devLog('[ProjectDetail] cmd_Output_Page request ->', payload);

        cmdOutputPage(payload, getCmdToken())
            .then(res => devLog('[ProjectDetail] cmd_Output_Page response <-', res))
            .catch(err => devLog('[ProjectDetail] cmd_Output_Page error <-', err));
    };

    return {
        isNodal, deptName, postCode, adminDeptName,
        loading, loadError, loadProject,
        status, statusMeta, changeStatusValue, setChangeStatusValue, applyChangeStatus,
        activeTab, setActiveTab,
        identity, updateIdentity, bannerError, onBannerSelected, clearBanner, onLogoSelected, clearLogo, logoDataUrl, bannerDataUrl,
        topBoxes, addTopBox, removeTopBox, updateTopBox,
        launch, updateLaunch,
        docs, missionDocRows, docUploading, docUploadError, onDocSelected, removeDoc,
        docPreview, openDocPreview, closeDocumentPreview,
        saving, savingAction, saveError, saveAs,
        saveSuccess, closeSaveSuccessModal,
        isWebpageOutputModalOpen, viewWebpageOutput, closeWebpageOutputModal: () => setIsWebpageOutputModalOpen(false),
        goHome
    };
};

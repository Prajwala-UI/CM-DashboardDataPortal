import { useCallback, useEffect, useRef, useState } from 'react';
import {
    cmdGetStateKpis, cmdAddStateKpi, cmdUpdateStateKpi, cmdDeleteStateKpi, cmdDeleteStateKpiTargetValue, cmdGetProjectKpiDistrict
} from '../API/cmdService';
import {
    toKpiRowVM, toDistrictKpiRows, buildAddStateKpiPayload, buildStateKpiUpdatePayload, buildDeleteKpiTargetValuePayload,
    getKpiQuarterOptions, buildKpiMilestoneDate, parseKpiMilestoneDate
} from '../Utils/projectModel';
import { extractKpiArray, formatApiResult, readFileAsBase64 } from '../Utils/projectDetailHelpers';
import { getCmdToken } from '../Utils/cmdSession';
import { extractErrorMessage, isOverviewSuccess, devLog } from '../Utils/apiHelpers';

const EMPTY_NEW_KPI = { name: '', unit: '', year: '', quarter: '', target: '', value: '', logoFileName: '', logoBase64: '' };
const EMPTY_DATA = [{ id: 0, date: '', target: '', value: '' }];

/**
 * KPIs tab of the Angular ProjectDetailComponent: State KPIs (list, inline edit + bulk save, create,
 * edit with multiple quarter columns, delete) and District KPIs (embedded in the State KPI response,
 * API fallback, save through the same State update endpoint).
 *
 * District values: like Angular, when they come embedded in the State KPI response the District tab
 * edits that KPI row's own `districts` array (so edits survive switching tabs and "Cancel" on the
 * District tab does not revert them - Angular re-reads the same array).
 */
export const useStateKpis = (projectId, postCode) => {
    const [kpiSubTab, setKpiSubTab] = useState('state');

    const [stateKpis, setStateKpis] = useState([]);
    const [kpiLoading, setKpiLoading] = useState(false);
    const [kpiLoadError, setKpiLoadError] = useState('');

    // bulk "Save" at the bottom of the State KPI table
    const [kpiSaving, setKpiSaving] = useState(false);
    const [kpiSaveError, setKpiSaveError] = useState('');

    // KPI save confirmation popup
    const [kpiSaveSuccess, setKpiSaveSuccess] = useState({ open: false, msg: '' });

    // Create KPI modal
    const [isCreateKpiModalOpen, setIsCreateKpiModalOpen] = useState(false);
    const [createKpiSubmitting, setCreateKpiSubmitting] = useState(false);
    const [createKpiError, setCreateKpiError] = useState('');
    const [newKpi, setNewKpi] = useState(EMPTY_NEW_KPI);
    const createKpiQuarterOptions = newKpi.year ? getKpiQuarterOptions(newKpi.year) : [];

    // Edit KPI modal
    const [isEditKpiModalOpen, setIsEditKpiModalOpen] = useState(false);
    const [editKpiSubmitting, setEditKpiSubmitting] = useState(false);
    const [editKpiError, setEditKpiError] = useState('');
    const [editKpiRow, setEditKpiRow] = useState(null);
    const [editKpiData, setEditKpiData] = useState([]);
    const [editKpiName, setEditKpiName] = useState('');
    const [editKpiUnit, setEditKpiUnit] = useState('');
    const [editKpiLogoFileName, setEditKpiLogoFileName] = useState('');
    const [editKpiLogoBase64, setEditKpiLogoBase64] = useState('');
    const [editKpiDeletingId, setEditKpiDeletingId] = useState(null);
    // ids of the data entries that already existed on the server when the modal opened
    const editKpiOriginalIds = useRef(new Set());

    // Delete KPI modal
    const [kpiToDelete, setKpiToDelete] = useState(null);
    const [deleteKpiSubmitting, setDeleteKpiSubmitting] = useState(false);
    const [deleteKpiError, setDeleteKpiError] = useState('');

    // District KPIs
    const [selectedStateKpiId, setSelectedStateKpiId] = useState('');
    const [districtSource, setDistrictSource] = useState('api'); // 'embedded' | 'api'
    const [districtApiRows, setDistrictApiRows] = useState([]);
    const [districtKpiName, setDistrictKpiName] = useState('');
    const [districtUnit, setDistrictUnit] = useState('');
    const [districtStateTarget, setDistrictStateTarget] = useState('');
    const [districtEnteredTotal, setDistrictEnteredTotal] = useState('');
    const [districtsFilled, setDistrictsFilled] = useState('');
    const [districtLoading, setDistrictLoading] = useState(false);
    const [districtLoadError, setDistrictLoadError] = useState('');
    const [districtSaving, setDistrictSaving] = useState(false);
    const [districtSaveError, setDistrictSaveError] = useState('');
    const [districtSaveSuccess, setDistrictSaveSuccess] = useState({ open: false, msg: '' });

    const selectedRow = stateKpis.find(k => k.kpiId === selectedStateKpiId);
    const districtRows = districtSource === 'embedded' ? (selectedRow ? selectedRow.districts : []) : districtApiRows;

    /* ---- District data ---- */

    /** Fallback only - see loadDistrictData(). */
    const loadDistrictKpis = useCallback(async (kpiId, kpiList) => {
        setDistrictSource('api');

        if (!projectId || !kpiId) {
            setDistrictApiRows([]);
            return;
        }

        setDistrictLoading(true);
        setDistrictLoadError('');

        const body = { project_id: projectId, kpI_id: kpiId };
        devLog('[ProjectDetail] cmd_Get_Project_KPI_District request ->', body);

        try {
            const res = await cmdGetProjectKpiDistrict(body, getCmdToken());
            setDistrictLoading(false);
            devLog('[ProjectDetail] cmd_Get_Project_KPI_District response <-', res);

            if (res && isOverviewSuccess(res)) {
                const districtArr = extractKpiArray(res);
                setDistrictApiRows(toDistrictKpiRows(districtArr));
                setDistrictUnit(res.unit || '');
                setDistrictStateTarget(res.state_Target || '');
                setDistrictEnteredTotal(res.entered_Total || '');
                setDistrictsFilled(res.districts_Filled || '');

                const selectedKpi = kpiList.find(k => k.kpiId === kpiId);
                setDistrictKpiName(selectedKpi ? selectedKpi.kpiName : (districtArr[0] ? districtArr[0].kpi : ''));
            } else {
                setDistrictApiRows([]);
                setDistrictLoadError((res && res.message) ? res.message : 'Could not load district KPIs.');
            }
        } catch (err) {
            setDistrictLoading(false);
            setDistrictApiRows([]);
            devLog('[ProjectDetail] cmd_Get_Project_KPI_District error <-', err);
            setDistrictLoadError(extractErrorMessage(err, 'Could not load district KPIs. Please try again.'));
        }
    }, [projectId]);

    /** Reads district values straight from the loaded State KPI row (row.districts); falls back to
     *  the district endpoint only if the selected row has none. */
    const loadDistrictData = useCallback((kpiList, kpiId) => {
        setDistrictLoadError('');
        const selected = kpiList.find(k => k.kpiId === kpiId);

        if (selected && selected.districts && selected.districts.length > 0) {
            devLog('[ProjectDetail] using districts embedded in cmd_get_state_kpis response for', selected.kpiName, '-', selected.districts.length, 'districts');

            setDistrictSource('embedded');
            setDistrictKpiName(selected.kpiName);
            setDistrictUnit(selected.unit);
            setDistrictStateTarget(selected.target);

            const total = selected.districts.reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
            const filledCount = selected.districts.filter(r => r.value && r.value.trim() && r.value.trim() !== '0').length;
            setDistrictEnteredTotal(total ? String(total) : '');
            setDistrictsFilled(`${filledCount} of ${selected.districts.length}`);
            return;
        }

        devLog('[ProjectDetail] selected KPI has no embedded districts - falling back to cmd_Get_Project_KPI_District');
        loadDistrictKpis(kpiId, kpiList);
    }, [loadDistrictKpis]);

    /* ---- State KPIs ---- */

    const selectedIdRef = useRef('');
    selectedIdRef.current = selectedStateKpiId;

    const loadStateKpis = useCallback(async () => {
        if (!projectId) {
            return;
        }

        setKpiLoading(true);
        setKpiLoadError('');

        // confirmed exact body: { projectId }
        const body = { projectId };
        devLog('[ProjectDetail] cmd_get_state_kpis request ->', body);

        try {
            const res = await cmdGetStateKpis(body, getCmdToken());
            setKpiLoading(false);
            devLog('[ProjectDetail] cmd_get_state_kpis response <-', res);

            const rows = (res && isOverviewSuccess(res)) ? extractKpiArray(res) : [];
            const list = rows.map((row) => toKpiRowVM(row));
            setStateKpis(list);

            let selected = selectedIdRef.current;
            if (!selected && list.length > 0) {
                selected = list[0].kpiId;
                setSelectedStateKpiId(selected);
            }
            // re-point district data at the freshly-reloaded row
            if (selected) {
                loadDistrictData(list, selected);
            }
        } catch (err) {
            setKpiLoading(false);
            devLog('[ProjectDetail] cmd_get_state_kpis error <-', err);
            setKpiLoadError(extractErrorMessage(err, 'Could not load KPIs. Please try again.'));
        }
    }, [projectId, loadDistrictData]);

    useEffect(() => {
        loadStateKpis();
    }, [loadStateKpis]);

    /** Inline TARGET / VALUE edit in the State KPI table (Angular edits row.data in place). */
    const updateKpiEntry = (rowIndex, entryIndex, field, value) => {
        setStateKpis(prev => prev.map((row, i) => (i !== rowIndex ? row : {
            ...row,
            data: row.data.map((d, j) => (j === entryIndex ? { ...d, [field]: value } : d))
        })));
    };

    /** District value edit - edits the KPI row's embedded districts, or the fallback rows. */
    const updateDistrictValue = (index, value) => {
        if (districtSource === 'embedded') {
            setStateKpis(prev => prev.map(row => (row.kpiId !== selectedStateKpiId ? row : {
                ...row,
                districts: row.districts.map((d, j) => (j === index ? { ...d, value } : d))
            })));
        } else {
            setDistrictApiRows(prev => prev.map((d, j) => (j === index ? { ...d, value } : d)));
        }
    };

    const closeKpiSaveSuccessModal = () => {
        setKpiSaveSuccess({ open: false, msg: '' });
        loadStateKpis();
    };

    /* ---- Create KPI modal ---- */
    const openCreateKpiModal = () => {
        setNewKpi(EMPTY_NEW_KPI);
        setCreateKpiError('');
        setIsCreateKpiModalOpen(true);
    };

    const closeCreateKpiModal = () => {
        if (createKpiSubmitting) {
            return;
        }
        setIsCreateKpiModalOpen(false);
    };

    const updateNewKpi = (patch) => setNewKpi(prev => ({ ...prev, ...patch }));

    /** Quarter dropdown changes with the selected Year - reset the previously chosen Quarter. */
    const onCreateKpiYearChange = (year) => updateNewKpi({ year, quarter: '' });

    const onKpiLogoSelected = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        updateNewKpi({ logoFileName: file.name });
        readFileAsBase64(file, (base64) => updateNewKpi({ logoBase64: base64 }));
        input.value = '';
    };

    const clearKpiLogo = () => updateNewKpi({ logoFileName: '', logoBase64: '' });

    const submitCreateKpi = async () => {
        setCreateKpiError('');

        if (!newKpi.name.trim()) {
            setCreateKpiError('Please enter a KPI name.');
            return;
        }
        if (!newKpi.unit) {
            setCreateKpiError('Please select a unit.');
            return;
        }

        setCreateKpiSubmitting(true);

        const payload = buildAddStateKpiPayload({
            projectId,
            name: newKpi.name.trim(),
            unit: newKpi.unit,
            logoBase64: newKpi.logoBase64,
            date: buildKpiMilestoneDate(newKpi.year, newKpi.quarter),
            target: (newKpi.target || '').trim() || '0',
            value: (newKpi.value || '').trim() || '0'
        });

        devLog('[ProjectDetail] cmd_add_state_kpi request ->', payload);

        try {
            const res = await cmdAddStateKpi(payload, getCmdToken());
            setCreateKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_add_state_kpi response <-', res);

            if (res && isOverviewSuccess(res)) {
                setIsCreateKpiModalOpen(false);
                setKpiSaveSuccess({ open: true, msg: formatApiResult(res, 'KPI created successfully.') });
            } else {
                setCreateKpiError(formatApiResult(res, 'Could not create the KPI. Please try again.'));
            }
        } catch (err) {
            setCreateKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_add_state_kpi error <-', err);
            setCreateKpiError(extractErrorMessage(err, 'Could not create the KPI. Please try again.'));
        }
    };

    /* ---- Edit KPI modal ---- */
    const openEditKpiModal = (row) => {
        setEditKpiRow(row);
        setEditKpiError('');
        setEditKpiDeletingId(null);

        setEditKpiName(row.kpiName);
        setEditKpiUnit(row.unit);
        setEditKpiLogoFileName('');
        // Pre-filled with the KPI's current logo so "Save" without touching the upload keeps it.
        setEditKpiLogoBase64(row.logo || '');

        // Start from the row's existing entries (including edits typed into the table); parse each
        // saved "date" back into Year/Quarter where possible.
        const source = (row.data && row.data.length) ? row.data : EMPTY_DATA;
        const data = source.map(d => {
            const parsed = parseKpiMilestoneDate(d.date);
            return { ...d, uiYear: parsed ? parsed.year : '', uiQuarter: parsed ? parsed.quarter : '' };
        });
        setEditKpiData(data);
        editKpiOriginalIds.current = new Set(data.map(d => d.id));
        setIsEditKpiModalOpen(true);
    };

    const closeEditKpiModal = () => {
        if (editKpiSubmitting) {
            return;
        }
        setIsEditKpiModalOpen(false);
        setEditKpiRow(null);
    };

    const onEditKpiLogoSelected = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        setEditKpiLogoFileName(file.name);
        readFileAsBase64(file, (base64) => setEditKpiLogoBase64(base64));
        input.value = '';
    };

    const clearEditKpiLogo = () => {
        setEditKpiLogoFileName('');
        setEditKpiLogoBase64('');
    };

    const addEditKpiRow = () => {
        setEditKpiData(prev => {
            const nextId = prev.reduce((max, d) => Math.max(max, d.id), -1) + 1;
            return [...prev, { id: nextId, date: '', target: '', value: '', uiYear: '', uiQuarter: '' }];
        });
    };

    /** Quarter options for one row - every quarter of its Year minus those used by other rows for that year. */
    const editKpiQuarterOptionsFor = (i) => {
        const entry = editKpiData[i];
        if (!entry || !entry.uiYear) {
            return [];
        }
        const usedByOthers = new Set(
            editKpiData
                .filter((e, idx) => idx !== i && e.uiYear === entry.uiYear && e.uiQuarter)
                .map(e => e.uiQuarter)
        );
        return getKpiQuarterOptions(entry.uiYear).filter(q => !usedByOthers.has(q));
    };

    const updateEditEntry = (i, patch) => setEditKpiData(prev => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

    /** Year changed - the picked Quarter is reset and the combined "date" cleared. */
    const onEditKpiYearChange = (i, year) => updateEditEntry(i, { uiYear: year, uiQuarter: '', date: '' });

    const onEditKpiQuarterChange = (i, quarter) => {
        const entry = editKpiData[i];
        if (!entry) {
            return;
        }
        updateEditEntry(i, { uiQuarter: quarter, date: buildKpiMilestoneDate(entry.uiYear, quarter) });
    };

    /** Removes one target/value column: a local-only column is dropped; a saved one is deleted
     *  through the API first and only removed on success. */
    const removeEditKpiRow = async (i) => {
        if (editKpiData.length <= 1 || !editKpiRow) {
            return;
        }

        const entry = editKpiData[i];

        if (!editKpiOriginalIds.current.has(entry.id)) {
            setEditKpiData(prev => prev.filter((_, idx) => idx !== i));
            return;
        }

        setEditKpiError('');
        setEditKpiDeletingId(entry.id);

        const payload = buildDeleteKpiTargetValuePayload(projectId, editKpiRow.kpiId, entry.id);
        devLog('[ProjectDetail] cmd_delete_state_kpi_target_value request ->', payload);

        try {
            const res = await cmdDeleteStateKpiTargetValue(payload, getCmdToken());
            setEditKpiDeletingId(null);
            devLog('[ProjectDetail] cmd_delete_state_kpi_target_value response <-', res);

            if (res && isOverviewSuccess(res)) {
                editKpiOriginalIds.current.delete(entry.id);
                setEditKpiData(prev => prev.filter(e => e.id !== entry.id));
            } else {
                setEditKpiError(formatApiResult(res, 'Could not delete this column. Please try again.'));
            }
        } catch (err) {
            setEditKpiDeletingId(null);
            devLog('[ProjectDetail] cmd_delete_state_kpi_target_value error <-', err);
            setEditKpiError(extractErrorMessage(err, 'Could not delete this column. Please try again.'));
        }
    };

    const submitEditKpi = async () => {
        if (!editKpiRow) {
            return;
        }

        setEditKpiError('');

        if (!editKpiName.trim()) {
            setEditKpiError('Please enter a KPI name.');
            return;
        }

        setEditKpiSubmitting(true);

        const row = editKpiRow;
        const payload = buildStateKpiUpdatePayload(
            projectId,
            postCode,
            row.kpiId,
            editKpiName.trim(),
            editKpiUnit,
            editKpiLogoBase64 || '',
            editKpiData,
            row.districts || []
        );

        devLog('[ProjectDetail] cmd_update_state_kpi (edit) request ->', payload);

        try {
            const res = await cmdUpdateStateKpi(payload, getCmdToken());
            setEditKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_update_state_kpi (edit) response <-', res);

            if (res && isOverviewSuccess(res)) {
                setIsEditKpiModalOpen(false);
                setEditKpiRow(null);
                setKpiSaveSuccess({ open: true, msg: formatApiResult(res, 'KPI updated successfully.') });
            } else {
                setEditKpiError(formatApiResult(res, 'Could not save this KPI. Please try again.'));
            }
        } catch (err) {
            setEditKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_update_state_kpi (edit) error <-', err);
            setEditKpiError(extractErrorMessage(err, 'Could not save this KPI. Please try again.'));
        }
    };

    /* ---- Bulk Save / Cancel of the State KPI table ---- */

    /** "Cancel" - discards unsaved edits by reloading from the API. */
    const cancelStateKpiEdits = () => {
        setKpiSaveError('');
        loadStateKpis();
    };

    /** One cmd_update_state_kpi call per row in parallel, then a single success/error result. */
    const saveAllStateKpis = async () => {
        if (stateKpis.length === 0) {
            return;
        }

        setKpiSaveError('');
        setKpiSaving(true);

        const rows = stateKpis;
        const callErrors = {};

        const results = await Promise.all(rows.map((row, i) => {
            const data = (row.data && row.data.length) ? row.data : EMPTY_DATA;

            const payload = buildStateKpiUpdatePayload(
                projectId, postCode, row.kpiId, row.kpiName, row.unit, row.logo, data, row.districts || []
            );

            devLog('[ProjectDetail] cmd_update_state_kpi request ->', payload);

            return cmdUpdateStateKpi(payload, getCmdToken()).catch(err => {
                devLog('[ProjectDetail] cmd_update_state_kpi error <-', row.kpiId, err);
                callErrors[i] = extractErrorMessage(err, 'Could not save this KPI.');
                return null;
            });
        }));

        setKpiSaving(false);
        devLog('[ProjectDetail] cmd_update_state_kpi bulk responses <-', results);

        const failed = results.map((res, i) => (!res || !isOverviewSuccess(res) ? i : -1)).filter(i => i !== -1);

        // row.saveError is only ever set here (never cleared until the list is reloaded), as in Angular
        if (failed.length > 0 || Object.keys(callErrors).length > 0) {
            setStateKpis(prev => prev.map((row, i) => {
                let saveError = callErrors[i] !== undefined ? callErrors[i] : row.saveError;
                if (failed.includes(i)) {
                    const res = results[i];
                    saveError = (res && res.message) ? res.message : (saveError || 'Could not save this KPI.');
                }
                return saveError === row.saveError ? row : { ...row, saveError };
            }));
        }

        if (failed.length === 0) {
            setKpiSaveSuccess({ open: true, msg: 'All KPI values saved successfully.' });
        } else {
            setKpiSaveError(`Could not save ${failed.length} of ${rows.length} KPI(s). See the errors below.`);
        }
    };

    /* ---- Delete State KPI ---- */
    const openDeleteKpiModal = (row) => {
        setKpiToDelete(row);
        setDeleteKpiError('');
    };

    const closeDeleteKpiModal = () => {
        if (deleteKpiSubmitting) {
            return;
        }
        setKpiToDelete(null);
    };

    /** Confirmed exact body: { kpi_id, isActive: false } (no project id). */
    const confirmDeleteKpi = async () => {
        if (!kpiToDelete) {
            return;
        }

        setDeleteKpiError('');
        setDeleteKpiSubmitting(true);

        const row = kpiToDelete;
        const payload = { kpi_id: row.kpiId, isActive: false };

        devLog('[ProjectDetail] cmd_delete_state_kpi request ->', payload);

        try {
            const res = await cmdDeleteStateKpi(payload, getCmdToken());
            setDeleteKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_delete_state_kpi response <-', res);

            if (res && isOverviewSuccess(res)) {
                setKpiToDelete(null);
                const remaining = stateKpis.filter(k => k.kpiId !== row.kpiId);
                setStateKpis(remaining);

                if (selectedStateKpiId === row.kpiId) {
                    const next = remaining.length > 0 ? remaining[0].kpiId : '';
                    setSelectedStateKpiId(next);
                    loadDistrictKpis(next, remaining);
                }
            } else {
                setDeleteKpiError((res && res.message) ? res.message : 'Could not delete this KPI. Please try again.');
            }
        } catch (err) {
            setDeleteKpiSubmitting(false);
            devLog('[ProjectDetail] cmd_delete_state_kpi error <-', err);
            setDeleteKpiError(extractErrorMessage(err, 'Could not delete this KPI. Please try again.'));
        }
    };

    /* ---- District tab ---- */
    const onSelectedStateKpiChange = (kpiId) => {
        setSelectedStateKpiId(kpiId);
        setDistrictSaveError('');
        loadDistrictData(stateKpis, kpiId);
    };

    /** "Cancel" - re-reads the district data (embedded rows keep their edits, as in Angular). */
    const cancelDistrictKpiEdits = () => {
        setDistrictSaveError('');
        loadDistrictData(stateKpis, selectedStateKpiId);
    };

    /** Single "Save" - same cmd_update_state_kpi call as the State tab, scoped to the selected KPI. */
    const saveDistrictKpis = async () => {
        if (!selectedStateKpiId || districtRows.length === 0) {
            return;
        }

        setDistrictSaveError('');
        setDistrictSaving(true);

        const selected = selectedRow;
        const payload = buildStateKpiUpdatePayload(
            projectId,
            postCode,
            selectedStateKpiId,
            districtKpiName,
            selected ? selected.unit : '',
            selected ? selected.logo : '',
            selected && selected.data && selected.data.length ? selected.data : EMPTY_DATA,
            districtRows
        );

        devLog('[ProjectDetail] cmd_update_state_kpi (district save) request ->', payload);

        try {
            const res = await cmdUpdateStateKpi(payload, getCmdToken());
            setDistrictSaving(false);
            devLog('[ProjectDetail] cmd_update_state_kpi (district save) response <-', res);

            if (res && isOverviewSuccess(res)) {
                setDistrictSaveSuccess({ open: true, msg: 'District KPI values saved successfully.' });
            } else {
                setDistrictSaveError((res && res.message) ? res.message : 'Could not save district KPIs. Please try again.');
            }
        } catch (err) {
            setDistrictSaving(false);
            devLog('[ProjectDetail] cmd_update_state_kpi (district save) error <-', err);
            setDistrictSaveError(extractErrorMessage(err, 'Could not save district KPIs. Please try again.'));
        }
    };

    /** "OK" on the District save pop-up - refreshes the KPI/district data. */
    const closeDistrictSaveSuccessModal = () => {
        setDistrictSaveSuccess({ open: false, msg: '' });
        loadStateKpis();
    };

    return {
        kpiSubTab, setKpiSubTab,
        stateKpis, kpiLoading, kpiLoadError, loadStateKpis, updateKpiEntry,
        kpiSaving, kpiSaveError, saveAllStateKpis, cancelStateKpiEdits,
        kpiSaveSuccess, closeKpiSaveSuccessModal,
        isCreateKpiModalOpen, openCreateKpiModal, closeCreateKpiModal, newKpi, updateNewKpi, onCreateKpiYearChange,
        createKpiQuarterOptions, onKpiLogoSelected, clearKpiLogo, submitCreateKpi, createKpiSubmitting, createKpiError,
        isEditKpiModalOpen, openEditKpiModal, closeEditKpiModal, editKpiRow, editKpiError, editKpiSubmitting,
        editKpiName, setEditKpiName, editKpiUnit, setEditKpiUnit, editKpiLogoFileName, editKpiLogoBase64,
        onEditKpiLogoSelected, clearEditKpiLogo, editKpiData, updateEditEntry, editKpiQuarterOptionsFor,
        onEditKpiYearChange, onEditKpiQuarterChange, addEditKpiRow, removeEditKpiRow, editKpiDeletingId, submitEditKpi,
        kpiToDelete, openDeleteKpiModal, closeDeleteKpiModal, confirmDeleteKpi, deleteKpiSubmitting, deleteKpiError,
        selectedStateKpiId, onSelectedStateKpiChange, districtRows, updateDistrictValue,
        districtKpiName, districtUnit, districtStateTarget, districtEnteredTotal, districtsFilled,
        districtLoading, districtLoadError, loadDistrictKpis: () => loadDistrictKpis(selectedStateKpiId, stateKpis),
        districtSaving, districtSaveError, saveDistrictKpis, cancelDistrictKpiEdits,
        districtSaveSuccess, closeDistrictSaveSuccessModal
    };
};

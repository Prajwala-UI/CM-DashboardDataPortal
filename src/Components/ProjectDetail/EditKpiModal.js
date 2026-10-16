import React, { useRef } from 'react';
import CmsModal from '../Common/CmsModal';
import { KPI_UNIT_OPTIONS, KPI_YEAR_OPTIONS } from '../../Utils/projectModel';

/** ================= EDIT KPI MODAL (multiple target/value pairs) ================= */
const EditKpiModal = ({ kpis }) => {
    const {
        closeEditKpiModal, editKpiRow, editKpiError, editKpiSubmitting,
        editKpiName, setEditKpiName, editKpiUnit, setEditKpiUnit, editKpiLogoFileName, editKpiLogoBase64,
        onEditKpiLogoSelected, clearEditKpiLogo, editKpiData, updateEditEntry, editKpiQuarterOptionsFor,
        onEditKpiYearChange, onEditKpiQuarterChange, addEditKpiRow, removeEditKpiRow, editKpiDeletingId, submitEditKpi
    } = kpis;
    const editKpiLogoInput = useRef(null);

    return (
        <CmsModal onClose={closeEditKpiModal}>

            <div className="cms-modal-header">
                <div className="cms-modal-title">Edit KPI(Key Performance Indicator)</div>
                <div className="cms-modal-subtitle">{editKpiRow?.kpiName}</div>
            </div>

            <div className="cms-modal-body">

                {editKpiError && <div className="cms-error-banner">{editKpiError}</div>}

                <div className="cms-field">
                    <label>KPI Name</label>
                    <input type="text" placeholder="e.g. No. of Beneficiaries Paid" value={editKpiName} onChange={(e) => setEditKpiName(e.target.value)} disabled={editKpiSubmitting} />
                </div>

                <div className="cms-grid-2">
                    <div className="cms-field">
                        <label>Unit</label>
                        <div className="cms-select-wrap">
                            <select value={editKpiUnit} onChange={(e) => setEditKpiUnit(e.target.value)} disabled={editKpiSubmitting} className="cms-select">
                                <option value="" disabled>--select--</option>
                                {KPI_UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cms-field">
                    <label>Upload KPI Logo <span className="cms-optional-tag">(Optional)</span></label>
                    <div className="cms-upload-wrap">
                        <input ref={editKpiLogoInput} type="file" accept="image/*" className="cms-hidden-file-input" onChange={onEditKpiLogoSelected} disabled={editKpiSubmitting} />
                        <div className="cms-upload-box" onClick={() => editKpiLogoInput.current.click()}>
                            {editKpiLogoBase64 && !editKpiLogoFileName && (
                                <img src={'data:image/png;base64,' + editKpiLogoBase64} alt="" style={{ height: '24px', width: '24px', objectFit: 'contain', marginRight: '8px' }} />
                            )}
                            {!editKpiLogoFileName && !editKpiLogoBase64 && <span>e.g. KPI logo</span>}
                            {!editKpiLogoFileName && editKpiLogoBase64 && <span>Current logo (click to replace)</span>}
                            {editKpiLogoFileName && <span>{editKpiLogoFileName}</span>}
                            <i className="fa fa-arrow-up"></i>
                        </div>
                        {(editKpiLogoFileName || editKpiLogoBase64) && <span className="cms-doc-action-link cms-doc-remove" onClick={clearEditKpiLogo}>Remove</span>}
                    </div>
                </div>

                <div className="cms-subsection-title cms-kpi-edit-heading">Target &amp; Actual Values of KPI</div>

                {editKpiData.map((entry, i) => {
                    const rowBusy = editKpiSubmitting || editKpiDeletingId === entry.id;
                    return (
                        <div className="cms-kpi-edit-column" key={entry.id}>
                            <div className="cms-kpi-edit-column-head">
                                <span className="cms-kpi-edit-column-badge">{i + 1}</span>
                                {editKpiData.length > 1 && (
                                    <button type="button" className="cms-icon-btn cms-icon-btn-danger cms-kpi-edit-remove"
                                        title="Remove this column" onClick={() => removeEditKpiRow(i)} disabled={editKpiSubmitting || editKpiDeletingId !== null}>
                                        {editKpiDeletingId === entry.id && <i className="fa fa-spinner fa-spin"></i>}
                                        {editKpiDeletingId !== entry.id && <i className="fa fa-trash-o"></i>}
                                    </button>
                                )}
                            </div>
                            <div className="cms-field cms-field-tight">
                                <label>Milestone Delivery Date</label>
                                <div className="cms-grid-2 cms-grid-2-tight">
                                    <div className="cms-field cms-field-tight">
                                        <label>Year</label>
                                        <div className="cms-select-wrap">
                                            <select value={entry.uiYear} onChange={(e) => onEditKpiYearChange(i, e.target.value)} disabled={rowBusy} className="cms-select">
                                                <option value="" disabled>--select--</option>
                                                {KPI_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="cms-field cms-field-tight">
                                        <label>Quarter</label>
                                        <div className="cms-select-wrap">
                                            <select value={entry.uiQuarter} onChange={(e) => onEditKpiQuarterChange(i, e.target.value)} disabled={rowBusy || !entry.uiYear} className="cms-select">
                                                <option value="" disabled>--select--</option>
                                                {editKpiQuarterOptionsFor(i).map(q => <option key={q} value={q}>{q}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {entry.date && !entry.uiYear && <div className="cms-kpi-legacy-date-note">Current: {entry.date}</div>}
                            </div>
                            <div className="cms-grid-2 cms-grid-2-tight">
                                <div className="cms-field cms-field-tight">
                                    <label>Target</label>
                                    <input type="text" placeholder="0" value={entry.target} onChange={(e) => updateEditEntry(i, { target: e.target.value })} disabled={rowBusy} />
                                </div>
                                <div className="cms-field cms-field-tight">
                                    <label>Actual</label>
                                    <input type="text" placeholder="0" value={entry.value} onChange={(e) => updateEditEntry(i, { value: e.target.value })} disabled={rowBusy} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button type="button" className="btn-secondary cms-kpi-add-btn" onClick={addEditKpiRow} disabled={editKpiSubmitting || editKpiDeletingId !== null}>
                    <i className="fa fa-plus"></i>&nbsp; Add Next Quarter Info
                </button>

            </div>

            <div className="cms-modal-footer">
                <button type="button" className="btn-secondary" onClick={closeEditKpiModal} disabled={editKpiSubmitting}>Cancel</button>
                <button type="button" className="btn-primary" onClick={submitEditKpi} disabled={editKpiSubmitting}>
                    {!editKpiSubmitting && <span>Save</span>}
                    {editKpiSubmitting && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Saving…</span>}
                </button>
            </div>

        </CmsModal>
    );
};

export default EditKpiModal;

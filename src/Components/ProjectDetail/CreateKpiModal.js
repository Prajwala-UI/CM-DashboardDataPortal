import React, { useRef } from 'react';
import CmsModal from '../Common/CmsModal';
import { KPI_UNIT_OPTIONS, KPI_YEAR_OPTIONS } from '../../Utils/projectModel';

/** ================= CREATE KPI MODAL ================= */
const CreateKpiModal = ({ kpis }) => {
    const {
        closeCreateKpiModal, newKpi, updateNewKpi, onCreateKpiYearChange, createKpiQuarterOptions,
        onKpiLogoSelected, clearKpiLogo, submitCreateKpi, createKpiSubmitting, createKpiError
    } = kpis;
    const kpiLogoInput = useRef(null);

    return (
        <CmsModal onClose={closeCreateKpiModal}>

            <div className="cms-modal-header">
                <div className="cms-modal-title">Create KPI (key Performance Indicator)</div>
            </div>

            <div className="cms-modal-body">

                {createKpiError && <div className="cms-error-banner">{createKpiError}</div>}

                <div className="cms-field">
                    <label>KPI Name</label>
                    <input type="text" placeholder="e.g. No. of Beneficiaries Paid" value={newKpi.name} onChange={(e) => updateNewKpi({ name: e.target.value })} disabled={createKpiSubmitting} />
                </div>

                <div className="cms-grid-2">
                    <div className="cms-field">
                        <label>Unit</label>
                        <div className="cms-select-wrap">
                            <select value={newKpi.unit} onChange={(e) => updateNewKpi({ unit: e.target.value })} disabled={createKpiSubmitting} className="cms-select">
                                <option value="" disabled>--select--</option>
                                {KPI_UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cms-field">
                    <label>Milestone Delivery Date</label>
                    <div className="cms-grid-2">
                        <div className="cms-field cms-field-tight">
                            <label>Year</label>
                            <div className="cms-select-wrap">
                                <select value={newKpi.year} onChange={(e) => onCreateKpiYearChange(e.target.value)} disabled={createKpiSubmitting} className="cms-select">
                                    <option value="" disabled>--select--</option>
                                    {KPI_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="cms-field cms-field-tight">
                            <label>Quarter</label>
                            <div className="cms-select-wrap">
                                <select value={newKpi.quarter} onChange={(e) => updateNewKpi({ quarter: e.target.value })} disabled={createKpiSubmitting || !newKpi.year} className="cms-select">
                                    <option value="" disabled>--select--</option>
                                    {createKpiQuarterOptions.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cms-grid-2">
                    <div className="cms-field">
                        <label>Target Value of KPI</label>
                        <input type="text" placeholder="0" value={newKpi.target} onChange={(e) => updateNewKpi({ target: e.target.value })} disabled={createKpiSubmitting} />
                    </div>
                    <div className="cms-field">
                        <label>Actual Value of KPI</label>
                        <input type="text" placeholder="0" value={newKpi.value} onChange={(e) => updateNewKpi({ value: e.target.value })} disabled={createKpiSubmitting} />
                    </div>
                </div>

                <div className="cms-field">
                    <label>Upload KPI Logo <span className="cms-optional-tag">(Optional)</span></label>
                    <div className="cms-upload-wrap">
                        <input ref={kpiLogoInput} type="file" accept="image/*" className="cms-hidden-file-input" onChange={onKpiLogoSelected} disabled={createKpiSubmitting} />
                        <div className="cms-upload-box" onClick={() => kpiLogoInput.current.click()}>
                            {!newKpi.logoFileName && <span>e.g. KPI logo</span>}
                            {newKpi.logoFileName && <span>{newKpi.logoFileName}</span>}
                            <i className="fa fa-arrow-up"></i>
                        </div>
                        {newKpi.logoFileName && <span className="cms-doc-action-link cms-doc-remove" onClick={clearKpiLogo}>Remove</span>}
                    </div>
                </div>

            </div>

            <div className="cms-modal-footer">
                <button type="button" className="btn-secondary" onClick={closeCreateKpiModal} disabled={createKpiSubmitting}>Cancel</button>
                <button type="button" className="btn-primary" onClick={submitCreateKpi} disabled={createKpiSubmitting}>
                    {!createKpiSubmitting && <span>Create</span>}
                    {createKpiSubmitting && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Creating…</span>}
                </button>
            </div>

        </CmsModal>
    );
};

export default CreateKpiModal;

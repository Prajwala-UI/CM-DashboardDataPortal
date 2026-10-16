import React from 'react';
import { ErrorMessage } from '../Common/StateMessage';

/** ============ DISTRICT KPIs ============ */
const DistrictKpiTable = ({ kpis }) => {
    const {
        stateKpis, selectedStateKpiId, onSelectedStateKpiChange, districtRows, updateDistrictValue,
        districtKpiName, districtUnit, districtStateTarget, districtEnteredTotal, districtsFilled,
        districtLoading, districtLoadError, loadDistrictKpis,
        districtSaving, districtSaveError, saveDistrictKpis, cancelDistrictKpiEdits
    } = kpis;

    const ready = !districtLoading && !districtLoadError && districtRows.length > 0;

    return (
        <>
            <div className="cms-section cms-district-picker">
                <div className="cms-section-body">
                    <div className="cms-field cms-district-kpi-field">
                        <label>Select KPI</label>
                        <div className="cms-select-wrap">
                            <select className="cms-select" value={selectedStateKpiId} onChange={(e) => onSelectedStateKpiChange(e.target.value)} disabled={stateKpis.length === 0}>
                                {stateKpis.length === 0 && <option value="" disabled>No State KPIs yet</option>}
                                {stateKpis.map(k => <option key={k.kpiId} value={k.kpiId}>{k.kpiName}</option>)}
                            </select>
                        </div>
                    </div>

                    {ready && (
                        <div className="cms-district-summary">
                            <div className="cms-district-stat">
                                <div className="cms-stat-label">Unit</div>
                                <div className="cms-stat-value">{districtUnit || '—'}</div>
                            </div>
                            <div className="cms-district-stat">
                                <div className="cms-stat-label">State Target</div>
                                <div className="cms-stat-value">{districtStateTarget || '—'}</div>
                            </div>
                            <div className="cms-district-stat">
                                <div className="cms-stat-label">Entered Total</div>
                                <div className="cms-stat-value">{districtEnteredTotal || '—'}</div>
                            </div>
                            <div className="cms-district-stat">
                                <div className="cms-stat-label">Districts Filled</div>
                                <div className="cms-stat-value">{districtsFilled || '—'}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {districtLoading && (
                <div className="cms-state-msg">
                    <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading district KPIs…
                </div>
            )}

            {!districtLoading && districtLoadError && <ErrorMessage message={districtLoadError} onRetry={loadDistrictKpis} />}

            {!districtLoading && !districtLoadError && stateKpis.length === 0 && (
                <div className="cms-state-msg">
                    Create a State KPI first to enter its district-level values.
                </div>
            )}

            {!districtLoading && !districtLoadError && stateKpis.length > 0 && districtRows.length === 0 && (
                <div className="cms-state-msg">
                    No district data available for this KPI yet.
                </div>
            )}

            {ready && (
                <>
                    {districtSaveError && <div className="cms-error-banner">{districtSaveError}</div>}

                    <div className="cms-section">
                        <div className="cms-table-scroll">
                            <table className="cms-table cms-district-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>KPI</th>
                                        <th>District</th>
                                        <th style={{ width: '220px' }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {districtRows.map((row, i) => (
                                        <tr key={i}>
                                            <td className="cms-district-kpi-name">{districtKpiName}</td>
                                            <td className="cms-row-label">{row.district}</td>
                                            <td>
                                                <input type="text" className="cms-kpi-value-input" value={row.value} onChange={(e) => updateDistrictValue(i, e.target.value)} disabled={districtSaving} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="cms-save-bar">
                        <button type="button" className="btn-secondary" onClick={cancelDistrictKpiEdits} disabled={districtSaving}>Cancel</button>
                        <button type="button" className="btn-primary" onClick={saveDistrictKpis} disabled={districtSaving}>
                            {!districtSaving && <span>Save</span>}
                            {districtSaving && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Saving…</span>}
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default DistrictKpiTable;

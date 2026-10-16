import React from 'react';
import { ErrorMessage } from '../Common/StateMessage';

/** ============ STATE KPIs ============ (inline Target/Value edit, bulk Save / Cancel) */
const StateKpiTable = ({ kpis, isNodal }) => {
    const {
        stateKpis, kpiLoading, kpiLoadError, loadStateKpis, kpiSaveError, kpiSaving, updateKpiEntry,
        openEditKpiModal, openDeleteKpiModal, cancelStateKpiEdits, saveAllStateKpis
    } = kpis;

    const ready = !kpiLoading && !kpiLoadError && stateKpis.length > 0;

    return (
        <>
            {kpiLoading && (
                <div className="cms-state-msg">
                    <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading KPIs…
                </div>
            )}

            {!kpiLoading && kpiLoadError && <ErrorMessage message={kpiLoadError} onRetry={loadStateKpis} />}

            {!kpiLoading && !kpiLoadError && stateKpis.length === 0 && (
                <div className="cms-state-msg">
                    No State KPIs yet. Click <b>Create KPI</b> to add the first one.
                </div>
            )}

            {kpiSaveError && <div className="cms-error-banner">{kpiSaveError}</div>}

            {ready && (
                <div className="cms-section">
                    <div className="cms-table-scroll">
                        <table className="cms-table cms-kpi-table">
                            <thead>
                                <tr>
                                    <th className="cms-row-sl" style={{ width: '48px' }}>Sl.No</th>
                                    <th style={{ width: '64px' }}>KPI Logo</th>
                                    <th style={{ width: '220px' }}>KPI Name</th>
                                    <th className="cms-kpi-milestones-header">Milestone Delivery Dates</th>
                                    <th className="cms-th-actions cms-th-nowrap" style={{ width: '100px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stateKpis.map((row, i) => (
                                    <tr key={row.kpiId || i}>
                                        <td className="cms-row-sl">{i + 1}</td>
                                        <td>
                                            <div className="cms-kpi-logo">
                                                {row.logo && <img src={'data:image/png;base64,' + row.logo} alt="" />}
                                                {!row.logo && <i className="fa fa-bar-chart"></i>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cms-kpi-name">{row.kpiName}</div>
                                            <div className="cms-kpi-unit">Unit: {row.unit || '—'}</div>
                                            {row.saveError && <div className="cms-error-banner cms-kpi-row-error">{row.saveError}</div>}
                                        </td>
                                        <td className="cms-kpi-milestones-cell">
                                            {row.data && row.data.length ? (
                                                <div className="cms-kpi-milestones-row">
                                                    {row.data.map((entry, j) => (
                                                        <table className="cms-kpi-milestone-box" key={j}>
                                                            <tbody>
                                                                <tr>
                                                                    <th colSpan={2} className="cms-kpi-milestone-date">{entry.date || '—'}</th>
                                                                </tr>
                                                                <tr>
                                                                    <th className="cms-kpi-milestone-subheader">Target</th>
                                                                    {/* the Nodal screen labels this column "Actual" */}
                                                                    <th className="cms-kpi-milestone-subheader">{isNodal ? 'Actual' : 'Value'}</th>
                                                                </tr>
                                                                <tr>
                                                                    <td><input type="text" className="cms-kpi-value-input" value={entry.target} onChange={(e) => updateKpiEntry(i, j, 'target', e.target.value)} disabled={kpiSaving} /></td>
                                                                    <td><input type="text" className="cms-kpi-value-input" value={entry.value} onChange={(e) => updateKpiEntry(i, j, 'value', e.target.value)} disabled={kpiSaving} /></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="cms-kpi-empty-cell">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="cms-kpi-action-buttons">
                                                <button type="button" className="cms-icon-btn" title="Edit KPI" onClick={() => openEditKpiModal(row)} disabled={kpiSaving}>
                                                    <i className="fa fa-pencil"></i>
                                                </button>
                                                <button type="button" className="cms-icon-btn cms-icon-btn-danger" title="Delete KPI" onClick={() => openDeleteKpiModal(row)} disabled={kpiSaving}>
                                                    <i className="fa fa-trash-o"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {ready && (
                <div className="cms-save-bar">
                    <button type="button" className="btn-secondary" onClick={cancelStateKpiEdits} disabled={kpiSaving}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={saveAllStateKpis} disabled={kpiSaving}>
                        {!kpiSaving && <span>Save</span>}
                        {kpiSaving && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Saving…</span>}
                    </button>
                </div>
            )}
        </>
    );
};

export default StateKpiTable;

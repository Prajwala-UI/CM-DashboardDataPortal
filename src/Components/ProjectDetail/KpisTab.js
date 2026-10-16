import React from 'react';
import StateKpiTable from './StateKpiTable';
import DistrictKpiTable from './DistrictKpiTable';

/** ============ KPIS TAB ============ */
const KpisTab = ({ kpis, isNodal }) => {
    const { kpiSubTab, setKpiSubTab, openCreateKpiModal } = kpis;

    return (
        <div className="cms-tab-panel">

            <div className="cms-kpi-toolbar">
                <div className="cms-kpi-subtabs">
                    <button type="button" className={`cms-kpi-subtab-btn${kpiSubTab === 'state' ? ' active' : ''}`} onClick={() => setKpiSubTab('state')}>State</button>
                    <button type="button" className={`cms-kpi-subtab-btn${kpiSubTab === 'district' ? ' active' : ''}`} onClick={() => setKpiSubTab('district')}>District</button>
                </div>

                {kpiSubTab === 'state' && (
                    <button type="button" className="btn-primary" onClick={openCreateKpiModal}>
                        <i className="fa fa-plus"></i>&nbsp; Create KPI
                    </button>
                )}
            </div>

            {kpiSubTab === 'state' && <StateKpiTable kpis={kpis} isNodal={isNodal} />}
            {kpiSubTab === 'district' && <DistrictKpiTable kpis={kpis} />}

        </div>
    );
};

export default KpisTab;

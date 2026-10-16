import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '../Hooks/useProjectDetail';
import { useStateKpis } from '../Hooks/useStateKpis';
import DetailHeader from '../Components/ProjectDetail/DetailHeader';
import OverviewTab from '../Components/ProjectDetail/OverviewTab';
import KpisTab from '../Components/ProjectDetail/KpisTab';
import CreateKpiModal from '../Components/ProjectDetail/CreateKpiModal';
import EditKpiModal from '../Components/ProjectDetail/EditKpiModal';
import DeleteKpiModal from '../Components/ProjectDetail/DeleteKpiModal';
import DocPreviewModal from '../Components/ProjectDetail/DocPreviewModal';
import WebpageOutputModal from '../Components/ProjectDetail/WebpageOutputModal';
import SuccessModal from '../Components/Common/SuccessModal';
import '../Styles/ProjectDetail.css';

/**
 * Angular ProjectDetailComponent (#/project/:id, variant "user") and its copy
 * NodalProjectDetailspageComponent (#/NodalProjectDetailspage/:id, variant "nodal").
 * Nodal differences: back/Cancel go to NodalDashboard, Save/Change Status need a project postCode,
 * and the State KPI sub-header reads "Actual" instead of "Value".
 */
const ProjectDetail = ({ variant }) => {
    const { id } = useParams();
    const projectId = id || '';

    const detail = useProjectDetail(projectId, variant);
    const kpis = useStateKpis(projectId, detail.postCode);

    // District Performance tile selection in the Webpage Output preview (kept while the page is open)
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    const { loading, loadError, loadProject, activeTab, setActiveTab, goHome } = detail;

    return (
        <div className="page-project-detail">
            <div className="cms-detail">

                <div className="cms-back-link" onClick={goHome}><i className="fa fa-long-arrow-left"></i> All projects</div>

                {/* loading */}
                {loading && (
                    <div className="cms-state-msg">
                        <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading project…
                    </div>
                )}

                {/* error */}
                {!loading && loadError && (
                    <div className="cms-state-msg cms-state-error">
                        {loadError}
                        {' '}
                        <button type="button" className="btn-link" onClick={loadProject}>Retry</button>
                    </div>
                )}

                {!loading && !loadError && (
                    <>
                        <DetailHeader detail={detail} />

                        {/* Overview / KPIs tabs */}
                        <div className="cms-tabs">
                            <div className={`cms-tab${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
                            <div className={`cms-tab${activeTab === 'kpis' ? ' active' : ''}`} onClick={() => setActiveTab('kpis')}>KPIs</div>
                        </div>

                        {activeTab === 'overview' && <OverviewTab detail={detail} />}
                        {activeTab === 'kpis' && <KpisTab kpis={kpis} isNodal={detail.isNodal} />}
                    </>
                )}

            </div>

            {kpis.isCreateKpiModalOpen && <CreateKpiModal kpis={kpis} />}
            {kpis.isEditKpiModalOpen && <EditKpiModal kpis={kpis} />}

            {/* ================= SAVE SUCCESS MODAL ================= */}
            {detail.saveSuccess.open && (
                <SuccessModal title={detail.saveSuccess.title} msg={detail.saveSuccess.msg} onOk={detail.closeSaveSuccessModal} />
            )}

            {/* ================= KPI SAVE SUCCESS MODAL ================= */}
            {kpis.kpiSaveSuccess.open && (
                <SuccessModal title={kpis.kpiSaveSuccess.msg} onOk={kpis.closeKpiSaveSuccessModal} />
            )}

            {/* ================= DISTRICT KPI SAVE SUCCESS MODAL ================= */}
            {kpis.districtSaveSuccess.open && (
                <SuccessModal title={kpis.districtSaveSuccess.msg} onOk={kpis.closeDistrictSaveSuccessModal} />
            )}

            {kpis.kpiToDelete && <DeleteKpiModal kpis={kpis} />}

            {detail.isWebpageOutputModalOpen && (
                <WebpageOutputModal detail={detail} kpis={kpis} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} />
            )}

            {/* ================= PDF PREVIEW MODAL ================= */}
            {detail.docPreview.open && (
                <DocPreviewModal label={detail.docPreview.label} url={detail.docPreview.url} onClose={detail.closeDocumentPreview} />
            )}
        </div>
    );
};

export default ProjectDetail;

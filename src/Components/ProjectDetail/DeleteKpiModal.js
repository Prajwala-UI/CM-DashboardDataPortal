import React from 'react';
import CmsModal from '../Common/CmsModal';

/** ================= DELETE KPI CONFIRMATION MODAL ================= */
const DeleteKpiModal = ({ kpis }) => {
    const { closeDeleteKpiModal, confirmDeleteKpi, deleteKpiSubmitting, deleteKpiError } = kpis;

    return (
        <CmsModal onClose={closeDeleteKpiModal} className="cms-modal-sm">
            <div className="cms-modal-header">
                <div className="cms-modal-title">Delete KPI</div>
                <button type="button" className="cms-modal-close" onClick={closeDeleteKpiModal} disabled={deleteKpiSubmitting} title="Close">
                    <i className="fa fa-times"></i>
                </button>
            </div>

            <div className="cms-modal-body">
                {deleteKpiError && <div className="cms-error-banner">{deleteKpiError}</div>}
                <div className="cms-confirm-text">Are you sure you want to delete this KPI?</div>
            </div>

            <div className="cms-modal-footer">
                <button type="button" className="btn-secondary" onClick={confirmDeleteKpi} disabled={deleteKpiSubmitting}>
                    {!deleteKpiSubmitting && <span>Yes</span>}
                    {deleteKpiSubmitting && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Deleting…</span>}
                </button>
                <button type="button" className="btn-primary" onClick={closeDeleteKpiModal} disabled={deleteKpiSubmitting}>No</button>
            </div>
        </CmsModal>
    );
};

export default DeleteKpiModal;

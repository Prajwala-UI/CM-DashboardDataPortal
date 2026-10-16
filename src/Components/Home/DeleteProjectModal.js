import React, { useState } from 'react';
import CmsModal from '../Common/CmsModal';
import { cmdDeleteProject } from '../../API/cmdService';
import { getCmdToken } from '../../Utils/cmdSession';
import { extractErrorMessage, isSuccess } from '../../Utils/apiHelpers';

/** 10) cmd_delete_project - "Delete Project" confirmation modal. BODY: { projectId, isActive: false } */
const DeleteProjectModal = ({ card, onClose, onDeleted }) => {
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const closeDeleteModal = () => {
        if (deleteSubmitting) {
            return;
        }
        onClose();
    };

    const confirmDelete = async () => {
        if (!card) {
            return;
        }

        setDeleteError('');
        setDeleteSubmitting(true);

        const payload = {
            projectId: card.projectId,
            isActive: false
        };

        try {
            const res = await cmdDeleteProject(payload, getCmdToken());
            setDeleteSubmitting(false);

            if (res && isSuccess(res)) {
                onDeleted(card.projectId);
            } else {
                setDeleteError((res && res.message) ? res.message : 'Could not delete the project. Please try again.');
            }
        } catch (err) {
            setDeleteSubmitting(false);
            setDeleteError(extractErrorMessage(err, 'Could not delete the project. Please try again.'));
        }
    };

    return (
        <CmsModal onClose={closeDeleteModal} className="cms-modal-sm">

            <div className="cms-modal-header">
                <div className="cms-modal-header-row">
                    <div className="cms-modal-title">Delete Project</div>
                    <button type="button" className="cms-modal-close" onClick={closeDeleteModal} disabled={deleteSubmitting} title="Close">
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            </div>

            <div className="cms-modal-body">
                {deleteError && <div className="cms-error-banner">{deleteError}</div>}
                <div className="cms-confirm-text">Are you Sure you want to delete the Project?</div>
            </div>

            <div className="cms-modal-footer">
                <button type="button" className="btn-secondary" onClick={confirmDelete} disabled={deleteSubmitting}>
                    {!deleteSubmitting && <span>Yes</span>}
                    {deleteSubmitting && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Deleting…</span>}
                </button>
                <button type="button" className="btn-primary" onClick={closeDeleteModal} disabled={deleteSubmitting}>No</button>
            </div>

        </CmsModal>
    );
};

export default DeleteProjectModal;

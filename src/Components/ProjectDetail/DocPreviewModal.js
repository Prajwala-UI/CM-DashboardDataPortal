import React from 'react';
import CmsModal from '../Common/CmsModal';

/** ================= PDF PREVIEW MODAL ================= */
const DocPreviewModal = ({ label, url, onClose }) => (
    <CmsModal onClose={onClose} className="cms-modal-lg">
        <div className="cms-modal-header">
            <div className="cms-modal-title">{label}</div>
            <button type="button" className="cms-modal-close" onClick={onClose} title="Close">
                <i className="fa fa-times"></i>
            </button>
        </div>
        <div className="cms-pdf-preview-body">
            {url && <iframe src={url} className="cms-pdf-frame" title={label}></iframe>}
        </div>
    </CmsModal>
);

export default DocPreviewModal;

import React from 'react';
import CmsModal from './CmsModal';

/** Green-tick confirmation popup with a single OK button (project-detail.component.html).
 *  `title` is the bold line; `msg` (optional) is the line under it. */
const SuccessModal = ({ title, msg, onOk }) => (
  <CmsModal onClose={onOk} className="cms-modal-sm">
    <div className="cms-modal-body cms-success-modal-body">
      <div className="cms-success-icon"><i className="fa fa-check-circle"></i></div>
      <div className="cms-success-modal-title">{title}</div>
      {msg !== undefined && <div className="cms-success-modal-msg">{msg}</div>}
    </div>
    <div className="cms-modal-footer cms-modal-footer-center">
      <button type="button" className="btn-primary" onClick={onOk}>OK</button>
    </div>
  </CmsModal>
);

export default SuccessModal;

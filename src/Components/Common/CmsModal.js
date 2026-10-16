import React from 'react';

/** The Angular "cms-modal-overlay" pattern: clicking the overlay closes, clicks inside don't. */
const CmsModal = ({ onClose, className = '', children }) => (
  <div className="cms-modal-overlay" onClick={onClose}>
    <div className={`cms-modal${className ? ' ' + className : ''}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default CmsModal;

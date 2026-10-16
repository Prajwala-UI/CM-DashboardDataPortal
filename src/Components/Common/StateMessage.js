import React from 'react';

/** "cms-state-msg" loading block - the list screens put the text under the spinner (<br><br>). */
export const LoadingMessage = ({ children }) => (
  <div className="cms-state-msg">
    <i className="fa fa-spinner fa-spin"></i>&nbsp; <br /><br /> {children}
  </div>
);

/** "cms-state-msg cms-state-error" block with a Retry link. */
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="cms-state-msg cms-state-error">
    {message}
    {' '}
    <button type="button" className="btn-link" onClick={onRetry}>Retry</button>
  </div>
);

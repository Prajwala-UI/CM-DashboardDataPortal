import React from 'react';

/** Suspense fallback while a lazy page chunk loads (Angular had no equivalent - kept minimal). */
const Loader = () => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
    <i className="fa fa-spinner fa-spin"></i>
  </div>
);

export default Loader;

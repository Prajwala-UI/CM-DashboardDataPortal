import React from 'react';

/** Title block + status bar (Project Status, Change Status + Apply, View Webpage Output). */
const DetailHeader = ({ detail }) => {
    const { adminDeptName, deptName, identity, statusMeta, changeStatusValue, setChangeStatusValue, status, saving, savingAction, applyChangeStatus, viewWebpageOutput } = detail;

    return (
        <div className="cms-detail-head">
            <div>
                <div className="cms-detail-org">{adminDeptName || deptName}</div>
                <div className="cms-detail-title">{identity.nameEn || '(Untitled project)'}</div>
                <div className="cms-detail-tagline">{identity.taglineEn}</div>
            </div>

            <div className="cms-detail-statusbar">
                <div className="cms-status-field">
                    <span className="cms-status-field-label">Project Status:</span>
                    <div className="cms-badge" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                        {statusMeta.label}
                    </div>
                </div>

                <div className="cms-status-field">
                    <span className="cms-status-field-label">Change Status:</span>
                    <div className="cms-select-wrap">
                        <select className="cms-select" value={changeStatusValue} onChange={(e) => setChangeStatusValue(e.target.value)} disabled={saving}>
                            <option value="" disabled>-- Select --</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                <button type="button" className="btn-secondary" onClick={applyChangeStatus}
                    disabled={saving || !changeStatusValue || changeStatusValue === status}>
                    {!(saving && savingAction === 'ChangeStatus') && <span>Apply</span>}
                    {saving && savingAction === 'ChangeStatus' && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Applying…</span>}
                </button>

                <button type="button" className="btn-primary" onClick={viewWebpageOutput} title="Open the public webpage for this project">
                    <i className="fa fa-external-link"></i>&nbsp; View Webpage Output
                </button>
            </div>
        </div>
    );
};

export default DetailHeader;

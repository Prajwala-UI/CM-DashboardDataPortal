import React, { useRef } from 'react';

/** One Milestone Documents row - its own hidden file input (upload / replace). */
const DocRow = ({ row, detail }) => {
    const { docUploading, onDocSelected, removeDoc, openDocPreview, saving } = detail;
    const fileInput = useRef(null);
    const uploading = !!docUploading[row.key];

    return (
        <tr>
            <td className="cms-row-label">{row.label}</td>
            <td>
                <div className="cms-doc-cell">

                    {uploading && (
                        <span className="cms-doc-uploading">
                            <i className="fa fa-spinner fa-spin"></i>&nbsp;Uploading…
                        </span>
                    )}

                    {!uploading && row.value && (
                        <>
                            <span className="cms-doc-chip" onClick={() => openDocPreview(row.key, row.label)} title="View PDF">
                                <i className="fa fa-file-pdf-o"></i>&nbsp;View PDF
                            </span>

                            <input ref={fileInput} type="file" accept="application/pdf" className="cms-hidden-file-input" onChange={(e) => onDocSelected(row.key, e)} disabled={saving} />
                            <div className="cms-doc-actions">
                                <span className="cms-doc-action-link" onClick={() => fileInput.current.click()}>Replace</span>
                                <span className="cms-doc-action-divider">|</span>
                                <span className="cms-doc-action-link cms-doc-remove" onClick={() => removeDoc(row.key)}>Remove</span>
                            </div>
                        </>
                    )}

                    {!uploading && !row.value && (
                        <>
                            <input ref={fileInput} type="file" accept="application/pdf" className="cms-hidden-file-input" onChange={(e) => onDocSelected(row.key, e)} disabled={saving} />
                            <button type="button" className="cms-doc-upload-btn" onClick={() => fileInput.current.click()} disabled={saving}>
                                <i className="fa fa-upload"></i>&nbsp;Upload PDF
                            </button>
                            <span className="cms-doc-none-hint">No PDF present</span>
                        </>
                    )}

                </div>
            </td>
        </tr>
    );
};

/** ---- Milestone Documents ---- each PDF uploads immediately when chosen. */
const MilestoneDocsSection = ({ detail }) => (
    <div className="cms-section">
        <div className="cms-section-head">
            <div className="cms-section-title">Milestone Documents</div>
            <div className="cms-section-hint">Each PDF uploads immediately when chosen - no need to click Save for these.</div>
        </div>

        {detail.docUploadError && <div className="cms-error-banner cms-doc-error">{detail.docUploadError}</div>}

        <table className="cms-table">
            <thead>
                <tr>
                    <th style={{ width: '40%' }}>Title</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {detail.missionDocRows.map(row => <DocRow key={row.key} row={row} detail={detail} />)}
            </tbody>
        </table>
    </div>
);

export default MilestoneDocsSection;

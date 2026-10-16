import React from 'react';

/** TABLE VIEW of the Home screen (home.component.html). */
const ProjectTable = ({ projects, onOpen, onDelete }) => (
    <div className="cms-table-scroll">
        <table className="cms-table cms-home-table">
            <thead>
                <tr>
                    <th style={{ width: '56px' }}>Logo</th>
                    <th>Project</th>
                    <th style={{ width: '140px' }}>Status</th>
                    <th style={{ width: '140px' }}>Physical Target</th>
                    <th style={{ width: '150px' }}>Financial Target</th>
                    <th className="cms-th-actions cms-th-nowrap" style={{ width: '90px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {projects.map(c => (
                    <tr key={c.projectId} className="cms-home-table-row" onClick={() => onOpen(c.projectId)}>
                        <td>
                            <div className="cms-card-logo cms-home-table-logo">
                                {c.logo && <img src={'data:image/png;base64,' + c.logo} alt="" />}
                                {!c.logo && <i className="fa fa-university"></i>}
                            </div>
                        </td>
                        <td>
                            <div className="cms-card-title cms-home-table-title">{c.nameEn}</div>
                            <div className="cms-card-org">{c.deptName}</div>
                        </td>
                        <td>
                            <div className="cms-badge" style={{ background: c.statusMeta.bg, color: c.statusMeta.color }}>
                                <span className="cms-badge-dot" style={{ background: c.statusMeta.color }}></span>
                                {c.statusMeta.label}
                            </div>
                        </td>
                        <td>{c.physicalTarget}</td>
                        <td>₹{c.financialTarget} Cr</td>
                        <td>
                            <span className="cms-card-footer-actions cms-home-table-actions" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="cms-footer-icon-btn cms-footer-icon-btn-light" title="Delete project" onClick={(e) => onDelete(c, e)}>
                                    <i className="fa fa-trash-o"></i>
                                </button>
                                <button type="button" className="cms-footer-icon-btn cms-footer-icon-btn-light" title="Edit project" onClick={() => onOpen(c.projectId)}>
                                    <i className="fa fa-pencil"></i>
                                </button>
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default ProjectTable;

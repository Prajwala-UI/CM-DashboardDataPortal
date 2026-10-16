import React from 'react';

/** One card of the Home card grid (home.component.html). */
const ProjectCard = ({ c, totalKpiCount, onOpen, onDelete }) => (
    <div className="cms-card" style={{ '--accent': c.statusMeta.color }} tabIndex={0}>

        <div className="cms-card-inner">
            <div className="cms-card-top">
                <div className="cms-card-org">{c.deptName}</div>
                <div className="cms-badge" style={{ background: c.statusMeta.bg, color: c.statusMeta.color }}>
                    <span className="cms-badge-dot" style={{ background: c.statusMeta.color }}></span>
                    {c.statusMeta.label}
                </div>
            </div>

            <div className="cms-card-heading">
                <div className="cms-card-logo">
                    {c.logo && <img src={'data:image/png;base64,' + c.logo} alt="" />}
                    {!c.logo && <i className="fa fa-university"></i>}
                </div>
                <div className="cms-card-title">{c.nameEn}</div>
            </div>

            {c.taglineEn && <div className="cms-card-tagline">{c.taglineEn}</div>}

            <div className="cms-card-stats">
                <div className="cms-stat">
                    <div className="cms-stat-label">Physical Target</div>
                    <div className="cms-stat-value">{c.physicalTarget}</div>
                </div>
                <div className="cms-stat" style={{ display: 'none' }}>
                    <div className="cms-stat-label">KPIs</div>
                    <div className="cms-stat-value cms-stat-accent">{totalKpiCount !== null ? totalKpiCount : '—'}</div>
                </div>
                <div className="cms-stat">
                    <div className="cms-stat-label">Financial Target</div>
                    <div className="cms-stat-value">₹{c.financialTarget} Cr</div>
                </div>
            </div>
        </div>

        <div className="cms-card-footer" onClick={() => onOpen(c.projectId)}>
            <span>Click to open project&nbsp; <i className="fa fa-angle-right"></i></span>

            <span className="cms-card-footer-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="cms-footer-icon-btn" title="Delete project" onClick={(e) => onDelete(c, e)}>
                    <i className="fa fa-trash-o"></i>
                </button>
                <button type="button" className="cms-footer-icon-btn" title="Edit project" onClick={() => onOpen(c.projectId)}>
                    <i className="fa fa-pencil"></i>
                </button>
            </span>
        </div>
    </div>
);

export default ProjectCard;

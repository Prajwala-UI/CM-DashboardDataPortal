import React from 'react';

/** STAT CARDS of the Nodal Dashboard (nodal-dashboard.component.html). */
const NodalStatCards = ({ summary, draftProjectsCount, publishedProjectsCount }) => (
    <div className="cms-nodal-stats">

        <div className="cms-nodal-stat-card cms-stat-blue">
            <div className="cms-nodal-stat-label">Total Departments</div>
            <div className="cms-nodal-stat-value">{summary.totalPostCodes}</div>
        </div>

        <div className="cms-nodal-stat-card cms-stat-purple">
            <div className="cms-nodal-stat-label">Total Mission's</div>
            <div className="cms-nodal-stat-value">{summary.totalProjects}</div>
        </div>

        <div className="cms-nodal-stat-card cms-stat-orange">
            <div className="cms-nodal-stat-label">Draft Mission's</div>
            <div className="cms-nodal-stat-value">{draftProjectsCount}</div>
        </div>

        <div className="cms-nodal-stat-card cms-stat-teal">
            <div className="cms-nodal-stat-label">Published Mission's</div>
            <div className="cms-nodal-stat-value">{publishedProjectsCount}</div>
        </div>

    </div>
);

export default NodalStatCards;

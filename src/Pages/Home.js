import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../Hooks/useProjects';
import { getStatusMeta } from '../Utils/projectModel';
import { getCmdPostCode, getCmdDeptName } from '../Utils/cmdSession';
import ProjectCard from '../Components/Home/ProjectCard';
import ProjectTable from '../Components/Home/ProjectTable';
import AddProjectModal from '../Components/Home/AddProjectModal';
import DeleteProjectModal from '../Components/Home/DeleteProjectModal';
import { LoadingMessage, ErrorMessage } from '../Components/Common/StateMessage';
import '../Styles/Home.css';

// status legend shown under the card grid (Draft / Published)
const statusLegend = [getStatusMeta('draft'), getStatusMeta('published')];

/** Angular HomeComponent (#/home) - department user's project list. */
const Home = () => {
    const navigate = useNavigate();

    // posting context (from the logged-in user)
    const postCode = useMemo(() => getCmdPostCode(), []);
    const deptName = useMemo(() => getCmdDeptName(), []);

    const { projects, totalKpiCount, loading, loadError, loadProjects, removeProjectLocally } = useProjects(postCode, deptName);

    // Card view / Table view toggle
    const [viewMode, setViewMode] = useState('card');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Card click / pencil (edit) icon -> Project Details screen
    const openProject = (projectId) => {
        if (!projectId) {
            return;
        }
        navigate(`/project/${projectId}`);
    };

    const openDeleteModal = (card, event) => {
        event.stopPropagation(); // don't trigger the card's "open project" click
        setProjectToDelete(card);
    };

    const onDeleted = (projectId) => {
        setProjectToDelete(null);
        // drop the card immediately so the grid updates without waiting on a refetch
        removeProjectLocally(projectId);
        loadProjects();
    };

    const hasProjects = !loading && !loadError && projects.length > 0;

    return (
        <div className="page-home">
            <div className="cms-home">

                <div className="cms-home-header">
                    <div>
                        <h1 className="cms-title">Your Projects</h1>
                        {deptName && (
                            <p className="cms-subtitle">{deptName} — open a project to enter overview details and KPI values.</p>
                        )}
                    </div>

                    <button type="button" className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <i className="fa fa-plus"></i>&nbsp; Add Project
                    </button>
                </div>

                {/* ================= VIEW TOGGLE ================= */}
                {hasProjects && (
                    <div className="cms-view-toggle">
                        <button type="button" className={`cms-view-toggle-btn${viewMode === 'card' ? ' active' : ''}`} onClick={() => setViewMode('card')}>
                            <i className="fa fa-th-large"></i>&nbsp; Card View
                        </button>
                        <button type="button" className={`cms-view-toggle-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>
                            <i className="fa fa-table"></i>&nbsp; Table View
                        </button>
                    </div>
                )}

                {/* loading */}
                {loading && <LoadingMessage>Loading Projects…</LoadingMessage>}

                {/* error */}
                {!loading && loadError && <ErrorMessage message={loadError} onRetry={loadProjects} />}

                {/* empty (no projects at all) */}
                {!loading && !loadError && projects.length === 0 && (
                    <div className="cms-state-msg">
                        No projects yet for this department. Click <b>Add Project</b> to create the first one.
                    </div>
                )}

                {hasProjects && (
                    <>
                        {/* ================= CARD GRID ================= */}
                        {viewMode === 'card' && (
                            <div className="cms-card-grid">
                                {projects.map(c => (
                                    <ProjectCard key={c.projectId} c={c} totalKpiCount={totalKpiCount} onOpen={openProject} onDelete={openDeleteModal} />
                                ))}
                            </div>
                        )}

                        {/* ================= TABLE VIEW ================= */}
                        {viewMode === 'table' && (
                            <ProjectTable projects={projects} onOpen={openProject} onDelete={openDeleteModal} />
                        )}

                        {/* ================= STATUS LEGEND ================= */}
                        <div className="cms-status-legend">
                            {statusLegend.map(s => (
                                <div className="cms-legend-item" key={s.label}>
                                    <span className="cms-badge-dot" style={{ background: s.color }}></span>
                                    {s.label}
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>

            {/* ================= ADD PROJECT MODAL ================= */}
            {isAddModalOpen && (
                <AddProjectModal postCode={postCode} onClose={() => setIsAddModalOpen(false)} onAdded={loadProjects} />
            )}

            {/* ================= DELETE PROJECT MODAL ================= */}
            {projectToDelete && (
                <DeleteProjectModal card={projectToDelete} onClose={() => setProjectToDelete(null)} onDeleted={onDeleted} />
            )}
        </div>
    );
};

export default Home;

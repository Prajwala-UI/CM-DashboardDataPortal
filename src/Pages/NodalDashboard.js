import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNodalList } from '../Hooks/useNodalList';
import { toNodalProjectRowVM } from '../Utils/nodalModel';
import { getCmdNodalOfficerName } from '../Utils/cmdSession';
import NodalStatCards from '../Components/Nodal/NodalStatCards';
import NodalProjectsTable from '../Components/Nodal/NodalProjectsTable';
import Pagination from '../Components/Nodal/Pagination';
import { LoadingMessage, ErrorMessage } from '../Components/Common/StateMessage';
import '../Styles/NodalDashboard.css';

const PAGE_SIZE = 10;
const mapProjects = (res) => (Array.isArray(res.projects) ? res.projects : []).map(row => toNodalProjectRowVM(row));
const TEXTS = {
    label: 'NodalDashboard',
    notSuccess: 'Could not load the dashboard.',
    error: 'Could not load the dashboard. Please try again.'
};

/** Angular NodalDashboardComponent (#/NodalDashboard) - "100-Days' Mission". */
const NodalDashboard = () => {
    const navigate = useNavigate();
    const nodalOfficerName = useMemo(() => getCmdNodalOfficerName(), []);

    // The Angular screen sends an empty admin_Dept_Code here (all departments)
    const { loading, loadError, summary, rows: projects, load, dataUpdatedAt } = useNodalList({
        screen: 'dashboard', adminDeptCode: '', mapRows: mapProjects, texts: TEXTS
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilterState] = useState('all');

    // Sorting
    const [sortColumn, setSortColumn] = useState('slNo');
    const [sortDirection, setSortDirection] = useState('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // every successful load starts back on page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [dataUpdatedAt]);

    // Derived counts for the extra stat cards
    const draftProjectsCount = projects.filter(p => (p.status || '').toLowerCase() === 'draft').length;
    const publishedProjectsCount = projects.filter(p => (p.status || '').toLowerCase() === 'published').length;

    /* ---- filtering ---- */
    const setStatusFilter = (f) => {
        setStatusFilterState(f);
        setCurrentPage(1);
    };

    const filteredProjects = useMemo(() => {
        const term = (searchTerm || '').trim().toLowerCase();

        const list = projects.filter(p => {
            const statusLower = (p.status || '').toLowerCase();

            if (statusFilter === 'draft' && statusLower !== 'draft') {
                return false;
            }
            if (statusFilter === 'published' && statusLower !== 'published') {
                return false;
            }
            if (!term) {
                return true;
            }
            return p.nameEn.toLowerCase().includes(term)
                || p.postCode.toLowerCase().includes(term)
                || p.adminDeptName.toLowerCase().includes(term);
        });

        /* ---- sorting ---- */
        if (!sortColumn || !sortDirection) {
            return list;
        }

        const dir = sortDirection === 'asc' ? 1 : -1;
        const col = sortColumn;

        return [...list].sort((a, b) => {
            let av = '';
            let bv = '';

            switch (col) {
                case 'adminDeptName':
                    av = (a.adminDeptName || '').toLowerCase();
                    bv = (b.adminDeptName || '').toLowerCase();
                    break;
                case 'nameEn':
                    av = (a.nameEn || '').toLowerCase();
                    bv = (b.nameEn || '').toLowerCase();
                    break;
                case 'status':
                    av = (a.status || '').toLowerCase();
                    bv = (b.status || '').toLowerCase();
                    break;
                case 'physicalTarget':
                    av = (a.physicalTarget || '').toLowerCase();
                    bv = (b.physicalTarget || '').toLowerCase();
                    break;
                case 'financialTarget':
                    av = (a.financialTarget || '').toLowerCase();
                    bv = (b.financialTarget || '').toLowerCase();
                    break;
                case 'slNo':
                default:
                    return 0;
            }

            if (av < bv) { return -1 * dir; }
            if (av > bv) { return 1 * dir; }
            return 0;
        });
    }, [projects, searchTerm, statusFilter, sortColumn, sortDirection]);

    const sortBy = (column) => {
        if (sortColumn === column) {
            // cycle: asc -> desc -> asc ...
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortIcon = (column) => {
        if (sortColumn !== column) {
            return 'fa fa-sort';
        }
        return sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
    };

    /* ---- pagination ---- */
    const total = filteredProjects.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / PAGE_SIZE);
    const pagedProjects = filteredProjects.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const pageStartIndex = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const pageEndIndex = Math.min(currentPage * PAGE_SIZE, total);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    };

    /** Global index (across filteredProjects) of a row in the current page. */
    const slNoFor = (indexOnPage) => (currentPage - 1) * PAGE_SIZE + indexOnPage + 1;

    /* ---- navigation ---- */
    const openProject = (projectId) => {
        if (!projectId) {
            return;
        }
        navigate(`/NodalProjectDetailspage/${projectId}`);
    };

    return (
        <div className="page-nodal-dashboard">
            <div className="cms-nodal">

                <div className="cms-nodal-header" style={{ display: 'none' }}>
                    <div>
                        <p className="cms-subtitle">
                            {summary && <span>{summary.adminDeptName}</span>}
                            {!summary && nodalOfficerName && <span>{nodalOfficerName}</span>}
                        </p>
                    </div>
                </div>

                {/* loading */}
                {loading && <LoadingMessage>Loading dashboard…</LoadingMessage>}

                {/* error */}
                {!loading && loadError && <ErrorMessage message={loadError} onRetry={load} />}

                {!loading && !loadError && summary && (
                    <>
                        {/* ================= STAT CARDS ================= */}
                        <NodalStatCards summary={summary} draftProjectsCount={draftProjectsCount} publishedProjectsCount={publishedProjectsCount} />

                        {/* empty */}
                        {projects.length === 0 && (
                            <div className="cms-state-msg">
                                No projects created under this department yet.
                            </div>
                        )}

                        {projects.length > 0 && (
                            <>
                                <div className="cms-nodal-toolbar">
                                    <div className="cms-nodal-filter-pills">
                                        <button type="button" className={`cms-nodal-pill${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                                        <button type="button" className={`cms-nodal-pill${statusFilter === 'draft' ? ' active' : ''}`} onClick={() => setStatusFilter('draft')}>Draft Projects</button>
                                        <button type="button" className={`cms-nodal-pill${statusFilter === 'published' ? ' active' : ''}`} onClick={() => setStatusFilter('published')}>Published Projects</button>
                                    </div>

                                    <div className="cms-nodal-search">
                                        <i className="fa fa-search"></i>
                                        <input type="text" placeholder="Search by project, postcode or department…" value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                                    </div>
                                </div>

                                <NodalProjectsTable pagedProjects={pagedProjects} sortBy={sortBy} sortIcon={sortIcon} slNoFor={slNoFor} openProject={openProject} />

                                {/* ================= PAGINATION ================= */}
                                {total > 0 && (
                                    <Pagination
                                        pageStartIndex={pageStartIndex} pageEndIndex={pageEndIndex} total={total}
                                        currentPage={currentPage} totalPages={totalPages} pageNumbers={pageNumbers}
                                        goToPage={goToPage} prevPage={() => goToPage(currentPage - 1)} nextPage={() => goToPage(currentPage + 1)}
                                    />
                                )}

                                {total === 0 && (
                                    <div className="cms-state-msg">
                                        No projects match your filters.
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default NodalDashboard;

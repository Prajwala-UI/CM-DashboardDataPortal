import React from 'react';

/** PAGINATION block of the Nodal Dashboard (nodal-dashboard.component.html). */
const Pagination = ({ pageStartIndex, pageEndIndex, total, currentPage, totalPages, pageNumbers, goToPage, prevPage, nextPage }) => (
    <div className="cms-pagination">
        <div className="cms-pagination-info">
            Showing
            {' '}<b>{pageStartIndex}</b>{' '}
            –
            {' '}<b>{pageEndIndex}</b>{' '}
            of
            {' '}<b>{total}</b>
        </div>

        <div className="cms-pagination-controls">
            <button type="button" className="cms-page-btn" disabled={currentPage === 1} onClick={prevPage}>
                <i className="fa fa-angle-left"></i>
            </button>

            {pageNumbers.map(n => (
                <button type="button" key={n}
                    className={`cms-page-btn${n === currentPage ? ' active' : ''}`}
                    onClick={() => goToPage(n)}>
                    {n}
                </button>
            ))}

            <button type="button" className="cms-page-btn" disabled={currentPage === totalPages} onClick={nextPage}>
                <i className="fa fa-angle-right"></i>
            </button>
        </div>
    </div>
);

export default Pagination;

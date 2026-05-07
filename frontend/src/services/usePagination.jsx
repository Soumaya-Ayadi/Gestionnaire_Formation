// usePagination.jsx — Reusable pagination hook + component
// Drop this file into frontend/src/services/usePagination.jsx

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_PAGE_SIZE = 10;

/**
 * usePagination — hook that slices data and manages page state.
 *
 * @param {Array}  data        — full array to paginate
 * @param {number} pageSize    — rows per page (default 10)
 * @returns {{ page, setPage, totalPages, paginated, showAll, setShowAll, reset }}
 */
export function usePagination(data, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // when filters change, jump back to page 1
  const reset = () => { setPage(1); setShowAll(false); };

  const paginated = useMemo(() => {
    if (showAll) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, showAll]);

  return { page, setPage, totalPages, paginated, showAll, setShowAll, reset };
}

/**
 * Pagination — renders page controls + "voir tous" toggle.
 */
export function Pagination({ page, setPage, totalPages, total, pageSize, showAll, setShowAll }) {
  if (total === 0) return null;

  const from = showAll ? 1 : (page - 1) * pageSize + 1;
  const to   = showAll ? total : Math.min(page * pageSize, total);

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        {from}–{to} sur <strong>{total}</strong>
      </span>

      {!showAll && (
        <div className="pagination-controls">
          <button
            className="pag-btn"
            onClick={() => setPage(1)}
            disabled={page === 1}
            title="Première page"
          >‹‹</button>
          <button
            className="pag-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            title="Page précédente"
          >‹</button>

          {/* page pills */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '…'
                ? <span key={`ellipsis-${i}`} className="pag-ellipsis">…</span>
                : <button
                    key={p}
                    className={`pag-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
            )
          }

          <button
            className="pag-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            title="Page suivante"
          >›</button>
          <button
            className="pag-btn"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            title="Dernière page"
          >››</button>
        </div>
      )}

      <button
        className="pag-showall"
        onClick={() => { setShowAll(s => !s); setPage(1); }}
      >
        {showAll ? `Paginer (${pageSize}/page)` : `Voir tous (${total})`}
      </button>
    </div>
  );
}

Pagination.propTypes = {
  page:       PropTypes.number.isRequired,
  setPage:    PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  total:      PropTypes.number.isRequired,
  pageSize:   PropTypes.number.isRequired,
  showAll:    PropTypes.bool.isRequired,
  setShowAll: PropTypes.func.isRequired,
};
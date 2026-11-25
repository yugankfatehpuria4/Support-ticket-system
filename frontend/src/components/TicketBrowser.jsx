import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, ticketApi } from '../api/client';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';
import { Icon } from './Icons';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  formatCategory,
  formatRelativeTime,
  shortTicketId,
} from '../utils/ticketMeta';

export default function TicketBrowser({ mode = 'user', title, subtitle, headerAction }) {
  const isAdminMode = mode === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const captionId = useId();

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const hasActiveFilters = Boolean(status || priority || category || search || sort !== '-createdAt');

  const updateParams = useCallback(
    (patch, resetPage = true) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, val]) => {
        if (!val || (key === 'sort' && val === '-createdAt') || (key === 'page' && val === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      if (resetPage && !('page' in patch)) {
        next.delete('page');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Debounce search input into URL query params
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;
    const id = setTimeout(() => {
      updateParams({ search: trimmed });
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, search, updateParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10, sort };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (search) params.search = search;

      const res = isAdminMode ? await adminApi.listTickets(params) : await ticketApi.list(params);
      setTickets(res.data.tickets || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: 10 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, page, sort, status, priority, category, search]);

  useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * (pagination.limit || 10) + 1;
  const endItem = Math.min(pagination.total, pagination.page * (pagination.limit || 10));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">
            {subtitle} · {pagination.total} {pagination.total === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
        {headerAction}
      </div>

      <section className="panel filter-panel" aria-label="Filter and search tickets">
        <form className="filters-grid" onSubmit={handleSearchSubmit}>
          <div className="search-field">
            <Icon name="search" size={16} className="search-field-icon" />
            <input
              type="search"
              aria-label="Search by title, description, or ticket ID"
              placeholder="Search by title or ID…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => updateParams({ priority: e.target.value })}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort tickets"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="-updatedAt">Recently updated</option>
          </select>

          {hasActiveFilters && (
            <button type="button" className="btn btn-ghost" onClick={clearFilters}>
              <Icon name="close" size={15} />
              Clear filters
            </button>
          )}
        </form>
      </section>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching tickets found' : 'No support tickets yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search query or clearing active filters.'
              : 'Create your first ticket and our support team will respond shortly.'
          }
          action={
            hasActiveFilters ? (
              <button type="button" className="btn" onClick={clearFilters}>
                Clear all filters
              </button>
            ) : !isAdminMode ? (
              <Link to="/tickets/new" className="btn btn-primary">
                <Icon name="plus" size={16} />
                Create New Ticket
              </Link>
            ) : null
          }
        />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby={captionId}
          className="table-wrap"
        >
          <table className={isAdminMode ? 'tickets-table-admin' : 'tickets-table-user'}>
            <caption id={captionId} className="visually-hidden">
              {title}
            </caption>
            <thead>
              <tr>
                <th>Ticket</th>
                {isAdminMode && <th>Requester</th>}
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <th scope="row" className="ticket-title-cell">
                    <Link to={`/tickets/${t._id}`} className="ticket-row-link">
                      <span className="mono muted small">{shortTicketId(t._id)}</span>
                      <span className="ticket-row-title">{t.title}</span>
                    </Link>
                  </th>
                  {isAdminMode && (
                    <td>
                      <div className="requester-cell">
                        <span>{t.createdBy?.name || '—'}</span>
                        <span className="muted small">{t.createdBy?.email || ''}</span>
                      </div>
                    </td>
                  )}
                  <td>{formatCategory(t.category)}</td>
                  <td>
                    <StatusBadge priority={t.priority} />
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="muted small">{formatRelativeTime(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 0 && (
        <div className="pager-bar">
          <span className="muted small">
            Showing {startItem}–{endItem} of {pagination.total}
          </span>
          {pagination.pages > 1 && (
            <div className="pager">
              <button
                type="button"
                className="btn btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => updateParams({ page: pagination.page - 1 }, false)}
              >
                Prev
              </button>
              <span className="small">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn-sm"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => updateParams({ page: pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { SkeletonTable } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Icon } from '../components/Icons';
import { formatDateTime, formatRelativeTime } from '../utils/ticketMeta';

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.activity({ page, limit: 20 });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Activity Log</h1>
          <p className="muted">
            Event-driven audit trail powered by Node.js EventEmitter · {pagination.total || 0} events
          </p>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={() => load(pagination.page)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={8} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No activity recorded yet"
          description="Ticket creations, status updates, and comments will appear here automatically."
        />
      ) : (
        <ul className="activity-list full">
          {logs.map((a) => (
            <li key={a._id}>
              <div className="activity-row">
                <span className="pill event-pill">{a.eventType?.replace(/_/g, ' ')}</span>
                <p>{a.message}</p>
              </div>
              <div className="activity-meta muted small">
                <span>{a.actor?.name || 'System'}</span>
                <span aria-hidden="true">·</span>
                <time title={formatDateTime(a.createdAt)}>
                  {formatRelativeTime(a.createdAt)}
                </time>
                {a.ticket?._id && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Link to={`/tickets/${a.ticket._id}`}>View ticket →</Link>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination.pages > 1 && (
        <div className="pager-bar">
          <span className="muted small">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="pager">
            <button
              type="button"
              className="btn btn-sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => load(pagination.page - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn btn-sm"
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => load(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

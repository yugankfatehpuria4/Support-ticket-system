import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonStats, SkeletonTable } from '../components/Skeleton';
import { Icon } from '../components/Icons';
import { formatCategory, formatRelativeTime, shortTicketId } from '../utils/ticketMeta';

const STATUS_ORDER = [
  { key: 'open', label: 'Open', colorClass: 'bar-open' },
  { key: 'in_progress', label: 'In Progress', colorClass: 'bar-in_progress' },
  { key: 'resolved', label: 'Resolved', colorClass: 'bar-resolved' },
  { key: 'closed', label: 'Closed', colorClass: 'bar-closed' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketApi.stats();
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byStatus = stats?.byStatus || {};
  const total = stats?.totalTickets || 0;
  const openCount = byStatus.open || 0;
  const inProgressCount = byStatus.in_progress || 0;
  const resolvedCount = byStatus.resolved || 0;
  const closedCount = byStatus.closed || 0;

  return (
    <div className="dashboard-page">
      <div className="page-head">
        <div>
          <h1>Welcome back, {user?.name}</h1>
          <p className="muted">Track your support requests, status progress, and recent replies.</p>
        </div>
        <div className="actions">
          <Link to="/tickets" className="btn">
            View all tickets
          </Link>
          <Link to="/tickets/new" className="btn btn-primary">
            <Icon name="plus" size={16} />
            Create New Ticket
          </Link>
        </div>
      </div>

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
        <>
          <SkeletonStats count={4} />
          <SkeletonTable rows={5} />
        </>
      ) : (
        <>
          <div className="stat-grid">
            <Link to="/tickets" className="stat stat-card-link">
              <span className="stat-label">Total Tickets</span>
              <strong>{total}</strong>
              <span className="stat-sub muted">{closedCount} closed archived</span>
            </Link>
            <Link to="/tickets?status=open" className="stat stat-card-link stat-accent-info">
              <span className="stat-label">Open Tickets</span>
              <strong>{openCount}</strong>
              <span className="stat-sub muted">Awaiting review</span>
            </Link>
            <Link to="/tickets?status=in_progress" className="stat stat-card-link stat-accent-warn">
              <span className="stat-label">In Progress</span>
              <strong>{inProgressCount}</strong>
              <span className="stat-sub muted">Being investigated</span>
            </Link>
            <Link to="/tickets?status=resolved" className="stat stat-card-link stat-accent-ok">
              <span className="stat-label">Resolved</span>
              <strong>{resolvedCount}</strong>
              <span className="stat-sub muted">Completed solutions</span>
            </Link>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recent Tickets</h2>
                  <p className="muted small">Your latest updated support requests</p>
                </div>
                <Link to="/tickets" className="link-btn small">
                  See all
                </Link>
              </div>

              {!stats?.recentTickets?.length ? (
                <EmptyState
                  title="No tickets submitted yet"
                  description="Create your first support ticket and our team will get right on it."
                  action={
                    <Link to="/tickets/new" className="btn btn-primary btn-sm">
                      Create New Ticket
                    </Link>
                  }
                />
              ) : (
                <ul className="ticket-mini-list">
                  {stats.recentTickets.map((t) => (
                    <li key={t._id}>
                      <Link to={`/tickets/${t._id}`} className="ticket-mini-link">
                        <div className="ticket-mini-main">
                          <span className="mono muted small">{shortTicketId(t._id)}</span>
                          <strong>{t.title}</strong>
                          <span className="muted small">
                            {formatCategory(t.category)} · Updated {formatRelativeTime(t.updatedAt)}
                          </span>
                        </div>
                        <div className="ticket-mini-badges">
                          <StatusBadge priority={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="dashboard-side-col">
              <section className="panel">
                <div className="panel-head">
                  <h2>Ticket Status Distribution</h2>
                </div>
                {total === 0 ? (
                  <p className="muted small">Distribution appears once you create a ticket.</p>
                ) : (
                  <>
                    <div className="dist-bar" aria-label="Ticket status distribution">
                      {STATUS_ORDER.map((s) => {
                        const count = byStatus[s.key] || 0;
                        const pct = (count / total) * 100;
                        if (pct <= 0) return null;
                        return (
                          <div
                            key={s.key}
                            className={`dist-bar-seg ${s.colorClass}`}
                            style={{ width: `${pct}%` }}
                            title={`${s.label}: ${count} (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>
                    <ul className="dist-legend">
                      {STATUS_ORDER.map((s) => {
                        const count = byStatus[s.key] || 0;
                        const pct = total ? Math.round((count / total) * 100) : 0;
                        return (
                          <li key={s.key}>
                            <Link to={`/tickets?status=${s.key}`} className="dist-legend-link">
                              <span className="dist-legend-label">
                                <span className={`legend-dot ${s.colorClass}`} aria-hidden="true" />
                                {s.label}
                              </span>
                              <span>
                                <strong>{count}</strong>{' '}
                                <span className="muted small">({pct}%)</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Recent Activity</h2>
                </div>
                {!stats?.recentActivity?.length ? (
                  <p className="muted small">No recent ticket activity yet.</p>
                ) : (
                  <ul className="activity-list">
                    {stats.recentActivity.map((a) => (
                      <li key={a._id}>
                        <div className="activity-compact">
                          <span className="pill event-pill">
                            {a.eventType?.replace(/_/g, ' ')}
                          </span>
                          <time className="muted small">{formatRelativeTime(a.createdAt)}</time>
                        </div>
                        <p className="small">{a.message}</p>
                        {a.ticket?._id && (
                          <Link to={`/tickets/${a.ticket._id}`} className="small">
                            Open ticket →
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { SkeletonStats, SkeletonTable } from '../components/Skeleton';
import { Icon } from '../components/Icons';
import { formatCategory, formatRelativeTime, shortTicketId } from '../utils/ticketMeta';

const PRIORITY_ROWS = [
  { key: 'urgent', label: 'Urgent', barClass: 'bar-urgent' },
  { key: 'high', label: 'High', barClass: 'bar-high' },
  { key: 'medium', label: 'Medium', barClass: 'bar-medium' },
  { key: 'low', label: 'Low', barClass: 'bar-low' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.stats();
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
  const byPriority = stats?.byPriority || {};
  const byCategory = stats?.byCategory || {};
  const total = stats?.totalTickets || 0;
  const openCount = byStatus.open || 0;
  const inProgressCount = byStatus.in_progress || 0;
  const resolvedCount = byStatus.resolved || 0;
  const closedCount = byStatus.closed || 0;
  const resolutionRate = total ? Math.round(((resolvedCount + closedCount) / total) * 100) : 0;

  return (
    <div className="dashboard-page">
      <div className="page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Queue overview across {stats?.totalUsers ?? '—'} customers and live event activity.
          </p>
        </div>
        <div className="actions">
          <Link to="/admin/activity" className="btn">
            Activity Log
          </Link>
          <Link to="/admin/tickets" className="btn btn-primary">
            Manage All Tickets
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
          <SkeletonStats count={5} />
          <SkeletonTable rows={6} />
        </>
      ) : (
        <>
          <div className="stat-grid stat-grid-5">
            <Link to="/admin/tickets" className="stat stat-card-link">
              <span className="stat-label">Total Tickets</span>
              <strong>{total}</strong>
              <span className="stat-sub muted">{stats.totalUsers} registered users</span>
            </Link>
            <Link to="/admin/tickets?status=open" className="stat stat-card-link stat-accent-info">
              <span className="stat-label">Open</span>
              <strong>{openCount}</strong>
              <span className="stat-sub muted">Needs triage</span>
            </Link>
            <Link
              to="/admin/tickets?status=in_progress"
              className="stat stat-card-link stat-accent-warn"
            >
              <span className="stat-label">In Progress</span>
              <strong>{inProgressCount}</strong>
              <span className="stat-sub muted">Active work</span>
            </Link>
            <Link
              to="/admin/tickets?status=resolved"
              className="stat stat-card-link stat-accent-ok"
            >
              <span className="stat-label">Resolved</span>
              <strong>{resolvedCount}</strong>
              <span className="stat-sub muted">{resolutionRate}% resolved/closed</span>
            </Link>
            <Link to="/admin/tickets?status=closed" className="stat stat-card-link">
              <span className="stat-label">Closed</span>
              <strong>{closedCount}</strong>
              <span className="stat-sub muted">Completed & locked</span>
            </Link>
          </div>

          <div className="two-col">
            <section className="panel">
              <div className="panel-head">
                <h2>Priority-Wise Statistics</h2>
                <span className="muted small">Click to filter</span>
              </div>
              <ul className="metric-bar-list">
                {PRIORITY_ROWS.map((row) => {
                  const count = byPriority[row.key] || 0;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={row.key}>
                      <Link to={`/admin/tickets?priority=${row.key}`} className="metric-bar-link">
                        <div className="metric-bar-row">
                          <StatusBadge priority={row.key} />
                          <span className="small">
                            <strong>{count}</strong>{' '}
                            <span className="muted">({pct}%)</span>
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${row.barClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Ticket Management Overview</h2>
                <span className="pill status-resolved">{resolutionRate}% Resolution Rate</span>
              </div>
              <div className="category-stat-grid">
                {Object.entries(byCategory).map(([cat, count]) => (
                  <Link
                    key={cat}
                    to={`/admin/tickets?category=${cat}`}
                    className="category-stat-chip"
                  >
                    <span>{formatCategory(cat)}</span>
                    <strong>{count}</strong>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recent Ticket Submissions</h2>
                  <p className="muted small">Latest incoming requests across all customers</p>
                </div>
                <Link to="/admin/tickets" className="link-btn small">
                  Open queue
                </Link>
              </div>
              {!stats?.recentTickets?.length ? (
                <p className="muted small">No tickets submitted yet.</p>
              ) : (
                <ul className="ticket-mini-list">
                  {stats.recentTickets.map((t) => (
                    <li key={t._id}>
                      <Link to={`/tickets/${t._id}`} className="ticket-mini-link">
                        <div className="ticket-mini-main">
                          <span className="mono muted small">
                            {shortTicketId(t._id)} · {t.createdBy?.name || 'User'}
                          </span>
                          <strong>{t.title}</strong>
                          <span className="muted small">
                            {formatCategory(t.category)} · {formatRelativeTime(t.createdAt)}
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

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Latest Activities</h2>
                  <p className="muted small">Real-time event audit trail</p>
                </div>
                <Link to="/admin/activity" className="link-btn small">
                  Full log
                </Link>
              </div>
              <ul className="activity-list">
                {(stats.recentActivity || []).map((a) => (
                  <li key={a._id}>
                    <div className="activity-compact">
                      <span className="pill event-pill">{a.eventType?.replace(/_/g, ' ')}</span>
                      <time className="muted small">{formatRelativeTime(a.createdAt)}</time>
                    </div>
                    <p className="small">{a.message}</p>
                    {a.ticket?._id && (
                      <Link to={`/tickets/${a.ticket._id}`} className="small">
                        Inspect ticket →
                      </Link>
                    )}
                  </li>
                ))}
                {!stats.recentActivity?.length && <li className="muted">No activity yet</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

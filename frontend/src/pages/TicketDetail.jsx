import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi, ticketApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonDetail } from '../components/Skeleton';
import { Icon } from '../components/Icons';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  formatCategory,
  formatDateTime,
  formatRelativeTime,
  shortTicketId,
} from '../utils/ticketMeta';

export default function TicketDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [comment, setComment] = useState('');
  const [adminForm, setAdminForm] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);
  const [commentBusy, setCommentBusy] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setErrorStatus(null);
    try {
      const res = await ticketApi.get(id);
      const t = res.data.ticket;
      setTicket(t);
      setComments(res.data.comments || []);
      setActivities(res.data.activities || []);
      setAdminForm({
        status: t.status,
        priority: t.priority,
        category: t.category,
        assignedTo: t.assignedTo?._id || '',
      });
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || 500);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    adminApi
      .admins()
      .then((res) => setAdmins(res.data.admins || []))
      .catch(() => {
        /* ignore */
      });
  }, [isAdmin]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ticket._id);
      toast.info('Ticket ID copied to clipboard');
    } catch {
      toast.info(`Ticket ID: ${ticket._id}`);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentBusy(true);
    setError('');
    try {
      await ticketApi.addComment(id, { body: comment.trim() });
      setComment('');
      toast.success('Reply posted');
      await load();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const saveAdmin = async (e) => {
    e.preventDefault();
    setAdminBusy(true);
    setError('');
    try {
      await adminApi.updateTicket(id, {
        status: adminForm.status,
        priority: adminForm.priority,
        category: adminForm.category,
        assignedTo: adminForm.assignedTo || null,
      });
      toast.success('Ticket properties updated');
      await load();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await ticketApi.remove(id);
      setDeleteOpen(false);
      toast.success('Ticket deleted');
      navigate(isAdmin ? '/admin/tickets' : '/tickets');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setDeleteOpen(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) return <SkeletonDetail />;

  if (error && !ticket) {
    const isForbidden = errorStatus === 403;
    const isMissing = errorStatus === 404 || errorStatus === 400;
    return (
      <div className="panel error-page-card">
        <Icon name={isForbidden ? 'shield' : 'alert'} size={28} />
        <h1>{isForbidden ? 'Access Restricted' : isMissing ? 'Ticket Not Found' : 'Unable to Load Ticket'}</h1>
        <p className="muted">
          {isForbidden
            ? 'You do not have permission to view another user’s private support ticket.'
            : error}
        </p>
        <div className="actions">
          <Link to={isAdmin ? '/admin/tickets' : '/tickets'} className="btn btn-primary">
            Go to {isAdmin ? 'All Tickets' : 'My Tickets'}
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isOwner = String(ticket.createdBy?._id || ticket.createdBy) === String(user?.id);
  const canEdit = isOwner && !['resolved', 'closed'].includes(ticket.status);
  const canDelete = isAdmin || (isOwner && ticket.status === 'open');
  const backPath = isAdmin ? '/admin/tickets' : '/tickets';

  return (
    <div className="detail">
      <div className="breadcrumb-row">
        <Link to={backPath} className="back-link">
          <Icon name="arrow-left" size={15} />
          Back to {isAdmin ? 'All Tickets' : 'My Tickets'}
        </Link>
      </div>

      <div className="page-head">
        <div>
          <div className="ticket-id-row">
            <span className="mono muted">{shortTicketId(ticket._id)}</span>
            <button
              type="button"
              className="btn-inline-copy mono"
              onClick={copyId}
              title="Copy full ticket ID"
            >
              <span>{ticket._id}</span>
              <Icon name="copy" size={13} />
            </button>
          </div>
          <h1>{ticket.title}</h1>
          <div className="meta-row">
            <StatusBadge status={ticket.status} />
            <StatusBadge priority={ticket.priority} />
            <StatusBadge category={ticket.category} />
          </div>
        </div>

        <div className="actions">
          {canEdit && (
            <Link className="btn" to={`/tickets/${id}/edit`}>
              <Icon name="edit" size={15} />
              Edit
            </Link>
          )}
          {canDelete && (
            <button type="button" className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
              <Icon name="trash" size={15} />
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="detail-layout">
        <div className="detail-main-col">
          <section className="panel">
            <h2>Description</h2>
            <p className="body-text">{ticket.description}</p>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Conversation ({comments.length})</h2>
            </div>

            <ul className="comment-list">
              {comments.map((c) => {
                const isStaff = c.author?.role === 'admin';
                return (
                  <li key={c._id} className={isStaff ? 'comment-staff' : 'comment-user'}>
                    <div className="comment-head">
                      <div className="comment-author">
                        <span className="comment-avatar" aria-hidden="true">
                          {c.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <strong>{c.author?.name || 'Unknown'}</strong>
                        <span className={`pill ${isStaff ? 'status-resolved' : ''}`}>
                          {isStaff ? 'Support Agent' : 'Requester'}
                        </span>
                      </div>
                      <time className="muted small" title={formatDateTime(c.createdAt)}>
                        {formatRelativeTime(c.createdAt)}
                      </time>
                    </div>
                    <p className="body-text">{c.body}</p>
                  </li>
                );
              })}
              {comments.length === 0 && (
                <li className="muted small">
                  No replies yet. Start the conversation below.
                </li>
              )}
            </ul>

            {ticket.status === 'closed' ? (
              <div className="closed-banner">
                <Icon name="shield" size={16} />
                <span>This ticket is closed and no longer accepts new comments.</span>
              </div>
            ) : (
              <form className="form-stack comment-form" onSubmit={submitComment}>
                <div className="field">
                  <div className="field-label-row">
                    <label htmlFor="comment-input">Add a reply</label>
                    <span className="muted small">{comment.length}/2000</span>
                  </div>
                  <textarea
                    id="comment-input"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Write an update or question for this ticket…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <span className="field-error-msg">Please enter a comment before posting.</span>
                </div>
                <div className="form-actions-end">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={commentBusy || !comment.trim()}
                  >
                    {commentBusy ? 'Posting…' : 'Post Reply'}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Activity Timeline</h2>
              <span className="muted small">{activities.length} events</span>
            </div>
            {activities.length === 0 ? (
              <p className="muted small">No recorded activity events for this ticket yet.</p>
            ) : (
              <ol className="timeline-list">
                {activities.map((a) => (
                  <li key={a._id} className="timeline-item">
                    <span className="timeline-marker" aria-hidden="true" />
                    <div className="timeline-content">
                      <div className="activity-compact">
                        <span className="pill event-pill">
                          {a.eventType?.replace(/_/g, ' ')}
                        </span>
                        <time className="muted small" title={formatDateTime(a.createdAt)}>
                          {formatRelativeTime(a.createdAt)}
                        </time>
                      </div>
                      <p className="small">{a.message}</p>
                      <span className="muted small">
                        By {a.actor?.name || 'System'}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="detail-side-col">
          <section className="panel">
            <h2>Ticket Information</h2>
            <dl className="info-dl">
              <div>
                <dt>Ticket ID</dt>
                <dd className="mono small">{shortTicketId(ticket._id)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <StatusBadge priority={ticket.priority} />
                </dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{formatCategory(ticket.category)}</dd>
              </div>
              <div>
                <dt>Requester</dt>
                <dd>
                  <strong>{ticket.createdBy?.name}</strong>
                  <span className="muted small block">{ticket.createdBy?.email}</span>
                </dd>
              </div>
              <div>
                <dt>Assigned To</dt>
                <dd>{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd className="small">{formatDateTime(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt>Last Updated</dt>
                <dd className="small">{formatDateTime(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {isAdmin && (
            <section className="panel">
              <h2>Admin Controls</h2>
              <form className="form-stack" onSubmit={saveAdmin}>
                <div className="field">
                  <label htmlFor="admin-status">Status</label>
                  <select
                    id="admin-status"
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="admin-priority">Priority</label>
                  <select
                    id="admin-priority"
                    value={adminForm.priority}
                    onChange={(e) => setAdminForm({ ...adminForm, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="admin-category">Category</label>
                  <select
                    id="admin-category"
                    value={adminForm.category}
                    onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="admin-assignee">Assign Agent</label>
                  <select
                    id="admin-assignee"
                    value={adminForm.assignedTo}
                    onChange={(e) => setAdminForm({ ...adminForm, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {admins.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={adminBusy}>
                  {adminBusy ? 'Updating…' : 'Update Ticket'}
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this support ticket?"
        message="This permanently removes the ticket and all associated comments. This action cannot be undone."
        confirmLabel="Delete Ticket"
        cancelLabel="Keep Ticket"
        danger
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { formatRelativeTime } from '../utils/ticketMeta';
import { Icon } from './Icons';

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const load = async () => {
    try {
      const res = await notificationApi.list();
      setItems(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {
      /* silent background refresh */
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const markAll = async () => {
    setBusy(true);
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOpenNotification = async (n) => {
    if (!n.read) {
      try {
        await notificationApi.markRead(n._id);
        setItems((prev) => prev.map((item) => (item._id === n._id ? { ...item, read: true } : item)));
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* continue navigation */
      }
    }
    setOpen(false);
    if (n.ticket?._id) {
      navigate(`/tickets/${n.ticket._id}`);
    }
  };

  const visibleItems = filter === 'unread' ? items.filter((n) => !n.read) : items;

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="btn btn-ghost notif-btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="bell" size={18} />
        <span className="hide-xs">Alerts</span>
        {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="region" aria-label="Notification center">
          <div className="notif-head">
            <div className="notif-head-title">
              <strong>Notifications</strong>
              {unread > 0 && <span className="muted small">({unread} unread)</span>}
            </div>
            {unread > 0 && (
              <button type="button" className="link-btn small" disabled={busy} onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-tabs" role="tablist" aria-label="Filter notifications">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`notif-tab ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'unread'}
              className={`notif-tab ${filter === 'unread' ? 'is-active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unread})
            </button>
          </div>

          {visibleItems.length === 0 ? (
            <div className="notif-empty">
              <Icon name="bell" size={20} />
              <p className="muted small">
                {filter === 'unread' ? 'You are all caught up!' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <ul className="notif-list">
              {visibleItems.slice(0, 15).map((n) => (
                <li key={n._id} className={n.read ? '' : 'unread'}>
                  <button
                    type="button"
                    className="notif-item-btn"
                    onClick={() => handleOpenNotification(n)}
                  >
                    <div className="notif-item-top">
                      <span className={`notif-dot ${n.read ? 'is-read' : ''}`} aria-hidden="true" />
                      <span className="notif-event mono">
                        {n.eventType?.replace(/_/g, ' ')}
                      </span>
                      <time className="muted small">{formatRelativeTime(n.createdAt)}</time>
                    </div>
                    <p className="notif-item-msg">{n.message}</p>
                    {n.ticket && (
                      <span className="notif-ticket-ref small muted">
                        Ticket: {n.ticket.title}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

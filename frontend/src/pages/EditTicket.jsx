import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ticketApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/Icons';
import { SkeletonDetail } from '../components/Skeleton';
import { CATEGORIES, PRIORITIES } from '../utils/ticketMeta';

export default function EditTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ticketApi
      .get(id)
      .then((res) => {
        const t = res.data.ticket;
        if (['resolved', 'closed'].includes(t.status)) {
          setError('Resolved or closed tickets cannot be edited.');
          return;
        }
        setForm({
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description cannot be empty.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await ticketApi.update(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });
      toast.success('Ticket updated');
      navigate(`/tickets/${id}`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!form && !error) return <SkeletonDetail />;

  return (
    <div className="narrow">
      <div className="breadcrumb-row">
        <Link to={`/tickets/${id}`} className="back-link">
          <Icon name="arrow-left" size={15} />
          Back to Ticket Details
        </Link>
      </div>

      <div className="page-head">
        <div>
          <h1>Edit Ticket</h1>
          <p className="muted">Update your ticket details while the request is active.</p>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      {form && (
        <form className="panel form-stack" onSubmit={onSubmit}>
          <div className="field">
            <div className="field-label-row">
              <label htmlFor="edit-title">Subject / Title</label>
              <span className="muted small">{form.title.length}/200</span>
            </div>
            <input
              id="edit-title"
              name="title"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <span className="field-error-msg">Title is required.</span>
          </div>

          <div className="row-2">
            <div className="field">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                name="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-priority">Priority</label>
              <select
                id="edit-priority"
                name="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="edit-desc">Detailed Description</label>
              <span className="muted small">{form.description.length}/5000</span>
            </div>
            <textarea
              id="edit-desc"
              name="description"
              required
              rows={6}
              maxLength={5000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <span className="field-error-msg">Description is required.</span>
          </div>

          <div className="form-actions-end">
            <Link to={`/tickets/${id}`} className="btn">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

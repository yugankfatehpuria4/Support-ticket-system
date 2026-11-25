import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/Icons';
import { CATEGORIES, PRIORITIES } from '../utils/ticketMeta';

export default function NewTicket() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please provide both a clear title and a detailed description.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await ticketApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });
      toast.success('Support ticket created successfully');
      navigate(`/tickets/${res.data.ticket._id}`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="narrow">
      <div className="breadcrumb-row">
        <Link to="/tickets" className="back-link">
          <Icon name="arrow-left" size={15} />
          Back to My Tickets
        </Link>
      </div>

      <div className="page-head">
        <div>
          <h1>Create New Ticket</h1>
          <p className="muted">
            Provide as much context as possible so our support engineers can assist quickly.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="panel form-stack" onSubmit={onSubmit}>
        <div className="field">
          <div className="field-label-row">
            <label htmlFor="ticket-title">Subject / Title</label>
            <span className="muted small">{form.title.length}/200</span>
          </div>
          <input
            id="ticket-title"
            name="title"
            required
            maxLength={200}
            placeholder="e.g., Unable to export Q3 billing invoice PDF"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <span className="field-error-msg">Please enter a ticket title (max 200 characters).</span>
        </div>

        <div className="row-2">
          <div className="field">
            <label htmlFor="ticket-category">Category</label>
            <select
              id="ticket-category"
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
            <label htmlFor="ticket-priority">Priority</label>
            <select
              id="ticket-priority"
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
            <label htmlFor="ticket-desc">Detailed Description</label>
            <span className="muted small">{form.description.length}/5000</span>
          </div>
          <span id="ticket-desc-hint" className="field-hint">
            Include steps to reproduce, expected behavior, and any error messages.
          </span>
          <textarea
            id="ticket-desc"
            name="description"
            required
            rows={6}
            maxLength={5000}
            aria-describedby="ticket-desc-hint"
            placeholder="Describe what happened, when it started, and any troubleshooting steps you already tried…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <span className="field-error-msg">Please describe the issue before submitting.</span>
        </div>

        <div className="form-actions-end">
          <Link to="/tickets" className="btn">
            Cancel
          </Link>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Submitting ticket…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

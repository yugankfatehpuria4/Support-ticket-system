export const CATEGORIES = [
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account Issues' },
  { value: 'billing', label: 'Billing' },
  { value: 'bug', label: 'Software Bugs' },
  { value: 'feature', label: 'Feature Requests' },
  { value: 'general', label: 'General Queries' },
  { value: 'network', label: 'Network Issues' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));
export const STATUS_LABELS = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));
export const PRIORITY_LABELS = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.label]));

export function formatCategory(value) {
  return CATEGORY_LABELS[value] || value || 'General';
}

export function formatStatus(value) {
  return STATUS_LABELS[value] || value?.replace('_', ' ') || '';
}

export function formatPriority(value) {
  return PRIORITY_LABELS[value] || value || '';
}

export function shortTicketId(id) {
  if (!id) return '';
  const str = String(id);
  return `#${str.slice(-6).toUpperCase()}`;
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

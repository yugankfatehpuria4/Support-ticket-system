import { formatCategory, formatPriority, formatStatus } from '../utils/ticketMeta';

export default function StatusBadge({ status, priority, category }) {
  if (priority) {
    return <span className={`pill priority-${priority}`}>{formatPriority(priority)}</span>;
  }
  if (category) {
    return <span className="pill category-pill">{formatCategory(category)}</span>;
  }
  return <span className={`pill status-${status}`}>{formatStatus(status)}</span>;
}

import { Icon } from './Icons';

export default function EmptyState({ icon = 'ticket', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </div>
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

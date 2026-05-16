import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, actionLabel, actionTo }) => {
  return (
    <div className="empty-state card" role="status" aria-live="polite">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionTo ? <Link to={actionTo} className="btn-secondary">{actionLabel}</Link> : null}
    </div>
  );
};

export default EmptyState;

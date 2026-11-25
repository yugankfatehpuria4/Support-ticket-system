import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';

export default function NotFound() {
  const { user, isAdmin } = useAuth();
  const homePath = user ? (isAdmin ? '/admin' : '/dashboard') : '/';

  return (
    <div className="center-page">
      <div className="panel error-page-card">
        <span className="mono muted">404</span>
        <h1>Page not found</h1>
        <p className="muted">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="actions">
          <Link to={homePath} className="btn btn-primary">
            <Icon name="arrow-left" size={16} />
            {user ? 'Return to Dashboard' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

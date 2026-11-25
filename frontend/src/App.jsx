import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Icon } from './components/Icons';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import EditTicket from './pages/EditTicket';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import Activity from './pages/Activity';
import NotFound from './pages/NotFound';

function Forbidden() {
  return (
    <div className="panel error-page-card">
      <Icon name="shield" size={28} />
      <h1>Access Denied (403)</h1>
      <p className="muted">
        You do not have administrator permissions to view this area.
      </p>
      <div className="actions">
        <Link to="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="center-page">
        <div className="loading-spinner-box">
          <div className="spinner" aria-hidden="true" />
          <p className="muted">Loading workspace…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Forbidden />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="center-page">
        <div className="loading-spinner-box">
          <div className="spinner" aria-hidden="true" />
          <p className="muted">Checking session…</p>
        </div>
      </div>
    );
  }
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/new" element={<NewTicket />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="tickets/:id/edit" element={<EditTicket />} />
        <Route
          path="admin"
          element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/tickets"
          element={
            <PrivateRoute adminOnly>
              <AdminTickets />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/activity"
          element={
            <PrivateRoute adminOnly>
              <Activity />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

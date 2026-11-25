import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon, LogoMark } from './Icons';
import Notifications from './Notifications';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTitleId = useId();

  const navItems = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
        { to: '/admin/tickets', label: 'All Tickets', icon: 'ticket' },
        { to: '/admin/activity', label: 'Activity Log', icon: 'activity' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
        { to: '/tickets', label: 'My Tickets', icon: 'ticket', end: true },
        { to: '/tickets/new', label: 'New Ticket', icon: 'plus' },
      ];

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out');
    navigate('/login');
  };

  const openDrawer = () => {
    const dialog = drawerRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      setDrawerOpen(true);
    }
  };

  const closeDrawer = () => {
    const dialog = drawerRef.current;
    if (dialog && dialog.open) {
      dialog.close();
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;

    const handleClose = () => setDrawerOpen(false);
    const handleBackdropClick = (e) => {
      if (e.target === dialog) closeDrawer();
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, []);

  const renderNavLinks = (onNavigate) => (
    <ul className="sidebar-nav-list">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="sidebar-head">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="brand brand-with-mark">
            <LogoMark size={24} />
            <span>Helpdesk</span>
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <p className="sidebar-section-label">{isAdmin ? 'Admin Console' : 'Workspace'}</p>
          {renderNavLinks()}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link sidebar-link-subtle">
            <Icon name="home" size={17} />
            <span>Public Home</span>
          </Link>
          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-meta">
              <strong>{user?.name}</strong>
              <span className="muted small">{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
            </div>
          </div>
        </div>
      </aside>

      <dialog
        ref={drawerRef}
        id="mobile-nav-drawer"
        className="mobile-drawer"
        aria-labelledby={drawerTitleId}
      >
        <div className="mobile-drawer-sheet">
          <div className="mobile-drawer-head">
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              id={drawerTitleId}
              className="brand brand-with-mark"
              onClick={closeDrawer}
            >
              <LogoMark size={24} />
              <span>Helpdesk</span>
            </Link>
            <button
              type="button"
              className="btn btn-ghost icon-btn"
              aria-label="Close navigation menu"
              autoFocus
              onClick={closeDrawer}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <nav className="mobile-drawer-nav" aria-label="Mobile navigation">
            {renderNavLinks(closeDrawer)}
          </nav>
          <div className="mobile-drawer-footer">
            <Link to="/" className="sidebar-link sidebar-link-subtle" onClick={closeDrawer}>
              <Icon name="home" size={17} />
              <span>Public Home</span>
            </Link>
            <button type="button" className="btn btn-danger btn-block" onClick={handleLogout}>
              <Icon name="logout" size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </dialog>

      <div className="app-content-col">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-ghost icon-btn mobile-menu-trigger"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={openDrawer}
            >
              <Icon name="menu" size={20} />
            </button>
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="brand brand-with-mark mobile-brand">
              <LogoMark size={22} />
              <span>Helpdesk</span>
            </Link>
          </div>

          <div className="topbar-right">
            {!isAdmin && (
              <Link to="/tickets/new" className="btn btn-primary btn-sm topbar-cta">
                <Icon name="plus" size={15} />
                <span>New Ticket</span>
              </Link>
            )}
            <Notifications />
            <div className="user-chip hide-xs">
              <span>{user?.name}</span>
              <em>{user?.role}</em>
            </div>
            <button type="button" className="btn btn-ghost btn-sm hide-sm" onClick={handleLogout}>
              <Icon name="logout" size={16} />
              <span>Log out</span>
            </button>
          </div>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

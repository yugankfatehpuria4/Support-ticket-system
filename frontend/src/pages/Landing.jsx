import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Icon, LogoMark } from '../components/Icons';

const FEATURES = [
  {
    icon: 'ticket',
    title: 'Easy Ticket Creation',
    desc: 'Capture structured requests with categories, urgency levels, and clear descriptions in seconds.',
  },
  {
    icon: 'activity',
    title: 'Real-Time Status Tracking',
    desc: 'Follow every ticket transparently across Open, In Progress, Resolved, and Closed stages.',
  },
  {
    icon: 'flag',
    title: 'Priority Management',
    desc: 'Triage Urgent, High, Medium, and Low issues so critical blockers get immediate attention.',
  },
  {
    icon: 'dashboard',
    title: 'Admin Dashboard',
    desc: 'Monitor queue distribution, unassigned backlog, and team activity from one unified workspace.',
  },
  {
    icon: 'message',
    title: 'Ticket Comments & Communication',
    desc: 'Collaborate directly inside ticket threads with role-badged replies between users and agents.',
  },
  {
    icon: 'bell',
    title: 'Activity Logs & Notifications',
    desc: 'Event-driven audit trails automatically alert owners and admins on every status change or reply.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Register and create a support ticket',
    desc: 'Sign in to your workspace, pick a category and priority, and describe the issue with full context.',
  },
  {
    step: '02',
    title: 'Admin reviews and manages the ticket',
    desc: 'Support admins triage incoming requests, assign owners, update priorities, and post troubleshooting replies.',
  },
  {
    step: '03',
    title: 'Track updates and receive resolution alerts',
    desc: 'Every comment and status transition triggers instant in-app notifications and an immutable activity timeline.',
  },
];

export default function Landing() {
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 40,
    resolvedTickets: 18,
    totalUsers: 5,
    resolutionRate: 96,
  });

  useEffect(() => {
    publicApi
      .stats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {
        /* keep fallback demo metrics */
      });
  }, []);

  const dashboardHref = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="landing" id="home">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="brand brand-with-mark">
            <LogoMark size={26} />
            <span>Helpdesk</span>
          </Link>

          <nav className="landing-nav" aria-label="Primary">
            <button
              type="button"
              className="btn btn-ghost landing-menu-btn"
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
              <span>Menu</span>
            </button>

            <div className={`landing-links ${mobileOpen ? 'is-open' : ''}`} id="landing-mobile-menu">
              <a href="#home" onClick={() => setMobileOpen(false)}>
                Home
              </a>
              <a href="#features" onClick={() => setMobileOpen(false)}>
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
                How It Works
              </a>
              <a href="#about" onClick={() => setMobileOpen(false)}>
                About
              </a>
              <div className="landing-auth-actions">
                {user ? (
                  <Link
                    to={dashboardHref}
                    className="btn btn-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    Go to Dashboard
                    <Icon name="arrow-right" size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-ghost"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="landing-container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <Icon name="shield" size={14} />
                Modern SaaS Support Desk
              </span>
              <h1>Support Management Made Simple.</h1>
              <p className="hero-subtitle">
                Streamline customer requests, prioritize urgent incidents, and collaborate across
                your team with real-time status tracking, threaded conversations, and automated
                event notifications.
              </p>
              <div className="hero-cta-row">
                <Link to={user ? dashboardHref : '/register'} className="btn btn-primary btn-lg">
                  {user ? 'Open Workspace' : 'Get Started'}
                  <Icon name="arrow-right" size={17} />
                </Link>
                <a href="#features" className="btn btn-lg">
                  Explore Features
                </a>
              </div>
              <div className="hero-trust-row">
                <span>Role-based access</span>
                <span aria-hidden="true">·</span>
                <span>Event-driven audit logs</span>
                <span aria-hidden="true">·</span>
                <span>Zero-clutter triage</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Helpdesk dashboard preview">
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="mono muted">helpdesk.app / queue</span>
                  <span className="pill status-resolved">Live</span>
                </div>
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span>Open Queue</span>
                    <strong>12</strong>
                  </div>
                  <div className="preview-stat">
                    <span>In Progress</span>
                    <strong>08</strong>
                  </div>
                  <div className="preview-stat">
                    <span>Resolution Rate</span>
                    <strong>{stats.resolutionRate}%</strong>
                  </div>
                </div>
                <div className="preview-ticket-list">
                  <div className="preview-ticket">
                    <div>
                      <strong>SSO SAML assertion fails for hyphenated domains</strong>
                      <span className="muted small">#8F2A1C · Technical Support</span>
                    </div>
                    <div className="preview-badges">
                      <span className="pill priority-urgent">Urgent</span>
                      <span className="pill status-in_progress">In Progress</span>
                    </div>
                  </div>
                  <div className="preview-ticket">
                    <div>
                      <strong>Duplicate charge on October Pro invoice</strong>
                      <span className="muted small">#4C19B0 · Billing</span>
                    </div>
                    <div className="preview-badges">
                      <span className="pill priority-high">High</span>
                      <span className="pill status-open">Open</span>
                    </div>
                  </div>
                  <div className="preview-ticket">
                    <div>
                      <strong>Unable to access account after password reset</strong>
                      <span className="muted small">#9D04E2 · Account Issues</span>
                    </div>
                    <div className="preview-badges">
                      <span className="pill priority-medium">Medium</span>
                      <span className="pill status-resolved">Resolved</span>
                    </div>
                  </div>
                </div>
                <div className="preview-activity-bar">
                  <Icon name="bell" size={15} />
                  <span>
                    <strong>Alex Morgan</strong> updated status to <em>Resolved</em> · 2m ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-container">
            <div className="section-head">
              <span className="section-tag">Capabilities</span>
              <h2>Everything needed to run a reliable helpdesk</h2>
              <p className="muted">
                Designed for clarity from initial ticket intake to final resolution and auditability.
              </p>
            </div>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <article className="feature-card" key={f.title}>
                  <div className="feature-icon" aria-hidden="true">
                    <Icon name={f.icon} size={20} />
                  </div>
                  <h3>{f.title}</h3>
                  <p className="muted">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="landing-container">
            <div className="section-head">
              <span className="section-tag">Workflow</span>
              <h2>How It Works</h2>
              <p className="muted">
                Three clear steps keep requesters informed and support engineers focused.
              </p>
            </div>
            <div className="steps-grid">
              {STEPS.map((s) => (
                <article className="step-card" key={s.step}>
                  <span className="step-num mono">{s.step}</span>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section" id="about">
          <div className="landing-container">
            <div className="stats-banner">
              <div className="stats-banner-copy">
                <span className="section-tag">Platform Metrics</span>
                <h2>Built on a clean, event-driven architecture</h2>
                <p className="muted">
                  Powered by Node.js, Express, MongoDB, JWT authentication, and an in-process
                  EventEmitter bus that records every ticket creation, assignment, status change,
                  and reply automatically.
                </p>
                <div className="demo-callout">
                  <div>
                    <strong>Try the live demo environment</strong>
                    <p className="muted small">
                      Admin: <code>admin@helpdesk.com</code> / <code>admin123</code> · User:{' '}
                      <code>user@helpdesk.com</code> / <code>user123</code>
                    </p>
                  </div>
                  <Link to={user ? dashboardHref : '/login'} className="btn btn-primary">
                    {user ? 'Open Dashboard' : 'Sign In to Demo'}
                  </Link>
                </div>
              </div>

              <div className="landing-stats-grid">
                <div className="landing-stat-card">
                  <strong>{stats.totalTickets}+</strong>
                  <span>Support Tickets Seeded</span>
                </div>
                <div className="landing-stat-card">
                  <strong>{stats.resolutionRate}%</strong>
                  <span>Resolution Rate</span>
                </div>
                <div className="landing-stat-card">
                  <strong>{stats.totalUsers}</strong>
                  <span>Active Demo Customers</span>
                </div>
                <div className="landing-stat-card">
                  <strong>5</strong>
                  <span>Real-Time Event Hooks</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand brand-with-mark">
              <LogoMark size={22} />
              <span>Helpdesk</span>
            </Link>
            <p className="muted small">
              A streamlined support ticket management platform for transparent issue tracking,
              triage, and team communication.
            </p>
          </div>

          <div>
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Capabilities</h4>
            <ul className="footer-links">
              <li>
                <Link to="/register">Ticket Creation</Link>
              </li>
              <li>
                <Link to="/login">Priority Triage</Link>
              </li>
              <li>
                <Link to="/login">Admin Analytics</Link>
              </li>
              <li>
                <Link to="/login">Activity Audit Log</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>support@helpdesk.example</li>
              <li>+1 (415) 555-0192</li>
              <li>548 Market St, San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <p className="muted small">
            © {new Date().getFullYear()} Helpdesk Support System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon, LogoMark } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-back-link">
          <Icon name="arrow-left" size={16} />
          Back to home
        </Link>

        <form className="auth-card" onSubmit={onSubmit}>
          <div className="auth-brand">
            <LogoMark size={26} />
            <span>Helpdesk</span>
          </div>
          <div>
            <h1>Sign in to your workspace</h1>
            <p className="muted">Raise, track, and resolve support tickets</p>
          </div>

          {error && (
            <div className="alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <span className="field-error-msg">Enter a valid email address.</span>
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-action">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                enterKeyHint="done"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="input-action-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
            <span className="field-error-msg">Password is required.</span>
          </div>

          <button className="btn btn-primary btn-block" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="demo-box">
            <p className="demo-box-title">Quick fill demo credentials</p>
            <div className="demo-btn-row">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fillDemo('user@helpdesk.com', 'user123')}
              >
                Demo User
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fillDemo('admin@helpdesk.com', 'admin123')}
              >
                Demo Admin
              </button>
            </div>
          </div>

          <p className="auth-footer">
            New to Helpdesk? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

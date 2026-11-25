import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon, LogoMark } from '../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Account created. Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
            <h1>Create your account</h1>
            <p className="muted">Start submitting and tracking support tickets</p>
          </div>

          {error && (
            <div className="alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              enterKeyHint="next"
              placeholder="Jordan Taylor"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <span className="field-error-msg">Please enter your name.</span>
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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
            <span className="field-error-msg">Enter an email address like you@company.com.</span>
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <span id="reg-password-hint" className="field-hint">
              Minimum 6 characters
            </span>
            <div className="input-with-action">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                enterKeyHint="done"
                aria-describedby="reg-password-hint"
                placeholder="Create a password"
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
            <span className="field-error-msg">Password must be at least 6 characters.</span>
          </div>

          <button className="btn btn-primary btn-block" disabled={busy} type="submit">
            {busy ? 'Creating account…' : 'Create account'}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// pages/LoginPage.jsx
// -----------------------------------------------------------------------------
// Email + password login. On success the auth store holds the JWT and we
// redirect to /dashboard (or wherever the user came from).
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Field, ErrorBanner, Spinner } from '../components/UI.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, token } = useAuthStore();
  const [email, setEmail] = useState('ada.admin+admin@medassist.dev');
  const [password, setPassword] = useState('password123');

  if (token) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (_) {
      /* error is in the store */
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 p-4">
      <div className="card w-full max-w-sm card-pad">
        <div className="mb-6">
          <h1 className="h-display text-2xl font-semibold text-ink-900">MedAssist</h1>
          <p className="mt-1 text-sm text-ink-500">Clinic operations & patient care</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner error={error ? { message: error } : null} />
          <Field label="Email">
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <Spinner /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-500">
          New here? <Link to="/register" className="text-ink-900 underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

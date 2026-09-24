// pages/RegisterPage.jsx
// -----------------------------------------------------------------------------
// Open registration (the capstone backend allows this). Defaults to a
// patient account, but the role picker lets you sign up as anyone.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, ROLE_LABELS } from '../store/authStore.js';
import { Field, ErrorBanner, Spinner } from '../components/UI.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      navigate('/dashboard', { replace: true });
    } catch (_) {}
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 p-4">
      <div className="card w-full max-w-sm card-pad">
        <div className="mb-6">
          <h1 className="h-display text-2xl font-semibold text-ink-900">Create account</h1>
          <p className="mt-1 text-sm text-ink-500">Sign up to use MedAssist.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner error={error ? { message: error } : null} />
          <Field label="Name">
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Role">
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <Spinner /> : null}
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-500">
          Already registered? <Link to="/login" className="text-ink-900 underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

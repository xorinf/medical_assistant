// pages/RegisterPage.jsx
// -----------------------------------------------------------------------------
// New Account Registration Portal
// Clean clinical styling, zero gradients, role selection with instant setup
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to MedAssist Home
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card grid md:grid-cols-12">
          {/* Form */}
          <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white font-bold">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">Create MedAssist Account</h1>
                  <p className="text-xs text-slate-500">Access clinic appointments, medical notes & reports</p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <ErrorBanner error={error ? { message: error } : null} />

                <Field label="Full Name">
                  <input
                    className="input"
                    required
                    placeholder="e.g. Dr. John Doe or Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Email Address">
                  <input
                    className="input"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field label="Password (min 6 chars)">
                  <input
                    className="input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field label="Select System Role">
                  <select
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5 text-sm font-semibold justify-center"
                >
                  {loading ? <Spinner /> : null}
                  {loading ? 'Creating Profile…' : 'Create Account'}
                </button>
              </form>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                Sign in here
              </Link>
            </div>
          </div>

          {/* Right Highlights */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between border-l border-slate-200 bg-slate-900 text-white p-8">
            <div>
              <span className="inline-block rounded bg-brand-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-100">
                Patient & Clinician Portal
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold leading-snug">
                Transparent healthcare coordination.
              </h2>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Patients can review visit notes in plain language, track investigation status, and manage verified digital prescriptions.
              </p>
            </div>

            <div className="my-6 overflow-hidden rounded-xl border border-slate-800 shadow-card">
              <img
                src="/images/lab.jpg"
                alt="Medical diagnostics"
                className="h-44 w-full object-cover"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Capstone Feature:</span> Multi-tenant role-based permissions and audit logging standard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

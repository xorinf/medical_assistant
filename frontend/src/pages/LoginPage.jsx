// pages/LoginPage.jsx
// -----------------------------------------------------------------------------
// Secure Staff & Patient Authentication Portal
// Pure solid clinical palette, zero tacky gradients, 1-click demo role selector
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Field, ErrorBanner, Spinner } from '../components/UI.jsx';

const PRESET_ACCOUNTS = [
  { role: 'Admin', email: 'ada.admin+admin@medassist.dev', name: 'Ada Admin' },
  { role: 'Doctor', email: 'dr..aryan.mehta+doctor@medassist.dev', name: 'Dr. Aryan Mehta' },
  { role: 'Reception', email: 'riya.reception+receptionist@medassist.dev', name: 'Riya Reception' },
  { role: 'Lab Tech', email: 'lab.lavanya+lab@medassist.dev', name: 'Lab Lavanya' },
  { role: 'Patient', email: 'aarav.sharma+patient@medassist.dev', name: 'Aarav Sharma' },
];

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
      /* error is displayed from auth store */
    }
  }

  function handleSelectPreset(presetEmail) {
    setEmail(presetEmail);
    setPassword('password123');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back Link */}
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

        {/* Main Card Grid */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card grid md:grid-cols-12">
          {/* Left: Form & Presets (7 cols) */}
          <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white font-bold">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">Sign in to MedAssist</h1>
                  <p className="text-xs text-slate-500">Clinical operations & patient care portal</p>
                </div>
              </div>

              {/* 1-Click Role Switcher */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/75 p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick-Fill Demo Credentials
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ACCOUNTS.map((p) => {
                    const isSelected = email === p.email;
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectPreset(p.email)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-700 text-white border-brand-700 shadow-subtle'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {p.role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <ErrorBanner error={error ? { message: error } : null} />

                <Field label="Email Address">
                  <input
                    type="email"
                    required
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="name@medassist.dev"
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
                    placeholder="••••••••"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5 text-sm font-semibold justify-center"
                >
                  {loading ? <Spinner /> : null}
                  {loading ? 'Authenticating…' : 'Sign In'}
                </button>
              </form>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
              Need a patient profile?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:underline">
                Register as new patient
              </Link>
            </div>
          </div>

          {/* Right: Clinical Imagery & Value (5 cols) */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between border-l border-slate-200 bg-slate-900 text-white p-8">
            <div>
              <span className="inline-block rounded bg-brand-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-100">
                Connected Operations
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold leading-snug">
                One platform for the entire care journey.
              </h2>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                From triage check-in to clinical consultation, pathology verification, and insurance invoicing.
              </p>
            </div>

            <div className="my-6 overflow-hidden rounded-xl border border-slate-800 shadow-card">
              <img
                src="/images/consultation.jpg"
                alt="Doctor consultation"
                className="h-44 w-full object-cover"
              />
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>MongoDB Atlas database connected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Role-based access & audit trail enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

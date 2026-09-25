// components/UI.jsx
// -----------------------------------------------------------------------------
// A handful of reusable building blocks. Keep them boring and monochrome.
// -----------------------------------------------------------------------------

export function Spinner({ className = '' }) {
  return (
    <span
      className={
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700 ' +
        className
      }
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, hint, action, icon }) {
  return (
    <div className="card card-pad text-center py-12">
      {icon ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon}
        </div>
      ) : (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      )}
      <h3 className="h-display text-base font-semibold text-slate-900">{title}</h3>
      {hint ? <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{hint}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  const msg = error?.message || 'Something went wrong';
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <svg className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <span className="font-semibold">Action required:</span> {msg}
      </div>
    </div>
  );
}

export function Pill({ children, className = '' }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

export function StatusPill({ status }) {
  const s = String(status || '').toLowerCase().trim();
  const label = s.replace(/_/g, ' ');

  // Solid, non-gradient semantic color tokens
  let toneClass = 'bg-slate-100 text-slate-700 border-slate-200';
  if (['completed', 'confirmed', 'paid', 'verified', 'active'].includes(s)) {
    toneClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
  } else if (['scheduled', 'in_progress', 'pending', 'sample_collected'].includes(s)) {
    toneClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
  } else if (['cancelled', 'unpaid', 'urgent', 'overdue'].includes(s)) {
    toneClass = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
  } else if (['in_consultation', 'arrived'].includes(s)) {
    toneClass = 'bg-teal-50 text-teal-800 border-teal-200 font-semibold';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs uppercase tracking-wider ${toneClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}

export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-modal animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="h-display text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50/50 px-6 py-3.5 rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="h-display text-2xl font-semibold text-ink-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function Money({ value }) {
  const n = Number(value || 0);
  return <span>₹{n.toFixed(2)}</span>;
}

export function DateText({ value }) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (_) {
    return String(value);
  }
}

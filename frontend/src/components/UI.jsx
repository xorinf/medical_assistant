// components/UI.jsx
// -----------------------------------------------------------------------------
// A handful of reusable building blocks. Keep them boring and monochrome.
// -----------------------------------------------------------------------------

export function Spinner({ className = '' }) {
  return (
    <span
      className={
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-800 ' +
        className
      }
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="card card-pad text-center">
      <h3 className="h-display text-lg font-semibold text-ink-900">{title}</h3>
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  const msg = error?.message || 'Something went wrong';
  return (
    <div className="rounded-md border border-ink-900 bg-ink-50 px-4 py-3 text-sm text-ink-900">
      <span className="font-medium">Error.</span> {msg}
    </div>
  );
}

export function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

export function StatusPill({ status }) {
  const label = String(status || '').replace(/_/g, ' ');
  return <Pill>{label}</Pill>;
}

export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center">
      <div className="card w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
          <h3 className="h-display text-base font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="card-pad">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-3">
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

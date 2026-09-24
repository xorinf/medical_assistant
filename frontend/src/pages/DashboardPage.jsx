// pages/DashboardPage.jsx
// -----------------------------------------------------------------------------
// Role-specific landing page. Each role sees the numbers that matter to them.
// -----------------------------------------------------------------------------

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { PageHeader, Spinner, Money } from '../components/UI.jsx';

function Stat({ label, value, to }) {
  const inner = (
    <div className="card card-pad">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-2 h-display text-2xl font-semibold text-ink-900">{value}</div>
    </div>
  );
  return to ? <Link to={to} className="block transition-colors hover:bg-ink-50">{inner}</Link> : inner;
}

function AdminDash() {
  const q = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/api/admin/stats') });
  if (q.isLoading) return <Spinner />;
  const s = q.data || {};
  return (
    <>
      <PageHeader title="Admin overview" subtitle="Clinic-wide totals for today." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Patients" value={s.patients ?? 0} to="/patients" />
        <Stat label="Doctors" value={s.doctors ?? 0} to="/doctors" />
        <Stat label="Today's appts" value={s.todaysAppointments ?? 0} to="/appointments" />
        <Stat label="Lab orders" value={s.labOrders ?? 0} to="/lab" />
        <Stat label="Invoices" value={s.invoices ?? 0} to="/invoices" />
        <Stat label="Users" value={s.users ?? 0} to="/admin/users" />
      </div>
    </>
  );
}

function DoctorDash() {
  const q = useQuery({
    queryKey: ['appts-mine'],
    queryFn: () => api.get('/api/appointments?status=scheduled'),
  });
  const queue = useQuery({
    queryKey: ['queue-today'],
    queryFn: () => api.get('/api/queue/today'),
  });
  if (q.isLoading || queue.isLoading) return <Spinner />;
  const appts = q.data?.items || [];
  const qToday = queue.data?.items || [];
  return (
    <>
      <PageHeader title="Doctor dashboard" subtitle="Your day at a glance." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">Upcoming appointments</h3>
          {appts.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {appts.slice(0, 6).map((a) => (
                <li key={a._id} className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <span>{a.patient?.name || 'Patient'}</span>
                  <span className="text-ink-500">{new Date(a.scheduledAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">Today's queue</h3>
          {qToday.length === 0 ? (
            <p className="text-sm text-ink-500">No patients in queue.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {qToday.map((a) => (
                <li key={a._id} className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <span>{a.patient?.name || 'Patient'}</span>
                  <span className="text-ink-500">
                    {a.queuePosition ? '#' + a.queuePosition : a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function ReceptionDash() {
  const appts = useQuery({
    queryKey: ['appts-today'],
    queryFn: () => api.get('/api/appointments'),
  });
  const queue = useQuery({
    queryKey: ['queue-today-r'],
    queryFn: () => api.get('/api/queue/today'),
  });
  if (appts.isLoading || queue.isLoading) return <Spinner />;
  return (
    <>
      <PageHeader title="Front desk" subtitle="Today's appointments and queue." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">All appointments</h3>
          <p className="text-sm text-ink-500">{(appts.data?.items || []).length} total scheduled.</p>
          <Link to="/appointments" className="btn btn-outline btn-sm mt-3">Open list</Link>
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">Queue</h3>
          <p className="text-sm text-ink-500">{(queue.data?.items || []).length} in queue today.</p>
          <Link to="/queue" className="btn btn-outline btn-sm mt-3">Manage queue</Link>
        </div>
      </div>
    </>
  );
}

function LabDash() {
  const q = useQuery({ queryKey: ['lab-orders'], queryFn: () => api.get('/api/lab/orders') });
  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];
  const pending = items.filter((i) => ['ordered', 'sample_collected', 'processing'].includes(i.status));
  return (
    <>
      <PageHeader title="Lab dashboard" subtitle="Pending orders waiting on action." />
      <div className="card card-pad">
        <h3 className="mb-3 h-display text-base font-semibold text-ink-900">
          Pending ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing in the queue. Nice.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {pending.map((o) => (
              <li key={o._id} className="flex items-center justify-between border-b border-ink-100 pb-2">
                <span>{o.patient?.name || 'Patient'} · {o.tests?.join(', ')}</span>
                <span className="pill">{o.status.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/lab" className="btn btn-outline btn-sm mt-3">Open lab</Link>
      </div>
    </>
  );
}

function PatientDash() {
  const me = useAuthStore((s) => s.user);
  const appts = useQuery({
    queryKey: ['appts-patient'],
    queryFn: () => api.get('/api/appointments'),
  });
  const rx = useQuery({
    queryKey: ['rx-mine'],
    queryFn: () => api.get('/api/prescriptions'),
  });
  if (appts.isLoading || rx.isLoading) return <Spinner />;
  return (
    <>
      <PageHeader
        title={`Welcome, ${me?.name || ''}`}
        subtitle="Your upcoming appointments and prescriptions."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">Appointments</h3>
          {(appts.data?.items || []).length === 0 ? (
            <p className="text-sm text-ink-500">No appointments yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {appts.data.items.slice(0, 5).map((a) => (
                <li key={a._id} className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <span>{a.doctor?.name || 'Doctor'}</span>
                  <span className="text-ink-500">{new Date(a.scheduledAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 h-display text-base font-semibold text-ink-900">Prescriptions</h3>
          {(rx.data?.items || []).length === 0 ? (
            <p className="text-sm text-ink-500">No prescriptions on file.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {rx.data.items.slice(0, 5).map((r) => (
                <li key={r._id} className="border-b border-ink-100 pb-2">
                  <div>{new Date(r.createdAt).toLocaleDateString()}</div>
                  {r.plainLanguage ? (
                    <div className="mt-1 whitespace-pre-line text-ink-600">{r.plainLanguage}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'admin')        return <AdminDash />;
  if (role === 'doctor')       return <DoctorDash />;
  if (role === 'receptionist') return <ReceptionDash />;
  if (role === 'lab')          return <LabDash />;
  return <PatientDash />;
}

// Keep `Money` available so we don't tree-shake the import on this page.
export { Money };

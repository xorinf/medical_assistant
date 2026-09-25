// pages/DashboardPage.jsx
// -----------------------------------------------------------------------------
// Clinical Operations Dashboard (Bento Architecture)
// Zero gradients, solid accessible palette, role-specific operational insights
// -----------------------------------------------------------------------------

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { PageHeader, Spinner, Money, StatusPill } from '../components/UI.jsx';

function StatCard({ label, value, to, icon, badge, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const content = (
    <div className="card p-5 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tones[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {badge && <span className="text-xs font-semibold text-slate-500">{badge}</span>}
      </div>
    </div>
  );

  return to ? <Link to={to} className="block transition-transform hover:-translate-y-0.5">{content}</Link> : content;
}

function AdminDash() {
  const q = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/api/admin/stats') });
  if (q.isLoading) return <div className="py-12 text-center"><Spinner className="h-6 w-6" /></div>;
  const s = q.data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic Administration Overview"
        subtitle="Real-time clinic metrics, operational load, and personnel records."
        actions={
          <div className="flex gap-2">
            <Link to="/appointments" className="btn btn-primary btn-sm">Schedule Appointment</Link>
            <Link to="/admin/users" className="btn btn-outline btn-sm">Manage Users</Link>
          </div>
        }
      />

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Patients"
          value={s.patients ?? 0}
          to="/patients"
          tone="brand"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          label="Active Doctors"
          value={s.doctors ?? 0}
          to="/doctors"
          tone="emerald"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatCard
          label="Today's Appts"
          value={s.todaysAppointments ?? 0}
          to="/appointments"
          tone="blue"
          badge="Scheduled"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Lab Orders"
          value={s.labOrders ?? 0}
          to="/lab"
          tone="amber"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />
        <StatCard
          label="Invoices"
          value={s.invoices ?? 0}
          to="/invoices"
          tone="slate"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
        <StatCard
          label="Staff Users"
          value={s.users ?? 0}
          to="/admin/users"
          tone="brand"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>

      {/* Operational Quick Actions Panel */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-900 mb-2">
            Clinic Operations Quick Launch
          </h3>
          <p className="text-xs text-slate-500 mb-5">Common administrative workflows and system navigation</p>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/patients" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 font-bold text-xs">P</div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Patient Directory</div>
                <div className="text-[10px] text-slate-500">View medical timelines</div>
              </div>
            </Link>

            <Link to="/appointments" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-50 text-emerald-700 font-bold text-xs">A</div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Appointments</div>
                <div className="text-[10px] text-slate-500">Doctor slots & booking</div>
              </div>
            </Link>

            <Link to="/queue" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-50 text-amber-700 font-bold text-xs">Q</div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Waiting Queue</div>
                <div className="text-[10px] text-slate-500">Manage patient tokens</div>
              </div>
            </Link>

            <Link to="/admin/audit" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-blue-700 font-bold text-xs">L</div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Audit Logs</div>
                <div className="text-[10px] text-slate-500">Security event history</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-base font-bold text-slate-900">System Health & Data Integrity</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <p className="text-xs text-slate-500">
              MongoDB cluster status: Connected to Atlas replicaSet with namespaced collections.
            </p>

            <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Database Engine</span>
                <span className="font-mono font-medium text-slate-900">MongoDB Atlas 8.0</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Server API</span>
                <span className="font-mono font-medium text-slate-900">Express 4.21 (Port 5050)</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>RBAC Enforcement</span>
                <span className="font-semibold text-brand-700">Strict JWT Middleware</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <Link to="/admin/services" className="btn btn-outline btn-sm">
              Configure Clinic Catalog →
            </Link>
          </div>
        </div>
      </div>
    </div>
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

  if (q.isLoading || queue.isLoading) {
    return <div className="py-12 text-center"><Spinner className="h-6 w-6" /></div>;
  }

  const appts = q.data?.items || [];
  const qToday = queue.data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physician Care Console"
        subtitle="Manage scheduled patient visits, consultation queue, and clinical notes."
        actions={
          <div className="flex gap-2">
            <Link to="/notes/new" className="btn btn-primary btn-sm">Create Clinical Note</Link>
            <Link to="/prescriptions/new" className="btn btn-outline btn-sm">New Prescription</Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Queue Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Patient Queue</h3>
              <p className="text-xs text-slate-500">Live walk-ins and checked-in consultations</p>
            </div>
            <Link to="/queue" className="btn btn-outline btn-sm text-xs">
              View Full Queue
            </Link>
          </div>

          {qToday.length === 0 ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-500">
              No patients currently waiting in queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {qToday.map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800 border border-brand-200">
                      {a.queuePosition ? `#${a.queuePosition}` : '•'}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{a.patient?.name || 'Patient'}</div>
                      <div className="text-[11px] text-slate-500">{a.reason || 'General Consultation'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={a.status} />
                    <Link
                      to={`/notes/new?patient=${a.patient?._id || ''}&appointment=${a._id}`}
                      className="btn btn-outline btn-sm text-[11px]"
                    >
                      Start Consult
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Appointments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Upcoming Appointments</h3>
              <p className="text-xs text-slate-500">Booked patient sessions</p>
            </div>
            <Link to="/appointments" className="btn btn-outline btn-sm text-xs">
              All Appointments
            </Link>
          </div>

          {appts.length === 0 ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-500">
              No upcoming scheduled appointments for today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appts.slice(0, 5).map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{a.patient?.name || 'Patient'}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {a.department || 'Medicine'}
                    </div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceptionDash() {
  const appts = useQuery({ queryKey: ['appts-today'], queryFn: () => api.get('/api/appointments') });
  const queue = useQuery({ queryKey: ['queue-today-r'], queryFn: () => api.get('/api/queue/today') });

  if (appts.isLoading || queue.isLoading) {
    return <div className="py-12 text-center"><Spinner className="h-6 w-6" /></div>;
  }

  const allAppts = appts.data?.items || [];
  const qItems = queue.data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reception & Patient Check-In"
        subtitle="Manage arrivals, dispatch tokens, and oversee clinic queue."
        actions={
          <div className="flex gap-2">
            <Link to="/appointments" className="btn btn-primary btn-sm">Book Appointment</Link>
            <Link to="/invoices" className="btn btn-outline btn-sm">Billing Counter</Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900">Active Queue ({qItems.length})</h3>
            <Link to="/queue" className="btn btn-outline btn-sm text-xs">Manage Queue</Link>
          </div>
          {qItems.length === 0 ? (
            <div className="text-xs text-slate-500 p-4 text-center bg-slate-50 rounded-lg">Queue is clear.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {qItems.map((q) => (
                <div key={q._id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      #{q.queuePosition || 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{q.patient?.name}</span>
                  </div>
                  <StatusPill status={q.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900">All Scheduled Appointments ({allAppts.length})</h3>
            <Link to="/appointments" className="btn btn-outline btn-sm text-xs">All Bookings</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {allAppts.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{a.patient?.name}</div>
                  <div className="text-[11px] text-slate-500">Dr. {a.doctor?.name || 'Assigned Doctor'}</div>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LabDash() {
  const q = useQuery({ queryKey: ['lab-orders'], queryFn: () => api.get('/api/lab/orders') });
  if (q.isLoading) return <div className="py-12 text-center"><Spinner className="h-6 w-6" /></div>;

  const items = q.data?.items || [];
  const pending = items.filter((i) => ['ordered', 'sample_collected', 'processing'].includes(i.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pathology Laboratory Console"
        subtitle="Manage diagnostic investigations, specimen statuses, and result verification."
        actions={
          <Link to="/lab" className="btn btn-primary btn-sm">Process Lab Orders</Link>
        }
      />

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            Pending Investigations ({pending.length})
          </h3>
          <span className="text-xs text-slate-500">{items.length} total orders logged</span>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            All lab orders processed and verified!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{o.patient?.name || 'Patient'}</div>
                  <div className="text-[11px] text-slate-500">{o.tests?.join(', ') || 'Diagnostic Panel'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={o.status} />
                  <Link to="/lab" className="btn btn-outline btn-sm text-[11px]">
                    Update Result
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDash() {
  const me = useAuthStore((s) => s.user);
  const appts = useQuery({ queryKey: ['appts-patient'], queryFn: () => api.get('/api/appointments') });
  const rx = useQuery({ queryKey: ['rx-mine'], queryFn: () => api.get('/api/prescriptions') });

  if (appts.isLoading || rx.isLoading) {
    return <div className="py-12 text-center"><Spinner className="h-6 w-6" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Patient Health Portal · ${me?.name || 'Welcome'}`}
        subtitle="Your clinical appointments, verified prescriptions, and diagnostic records."
        actions={
          <Link to="/appointments" className="btn btn-primary btn-sm">Request Appointment</Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-900 mb-3">Your Appointments</h3>
          {(appts.data?.items || []).length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg">No appointments recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {appts.data.items.slice(0, 5).map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{a.doctor?.name || 'Consultant'}</div>
                    <div className="text-[11px] text-slate-500">{new Date(a.scheduledAt).toLocaleString()}</div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-900 mb-3">Verified Prescriptions</h3>
          {(rx.data?.items || []).length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg">No prescriptions on file.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {rx.data.items.slice(0, 5).map((r) => (
                <div key={r._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Prescribed on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Active
                    </span>
                  </div>
                  {r.plainLanguage && (
                    <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {r.plainLanguage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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

export { Money };

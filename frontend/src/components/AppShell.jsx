// components/AppShell.jsx
// -----------------------------------------------------------------------------
// Sidebar + topbar that wraps every logged-in route.
// Sidebar entries are filtered by the user's role.
// -----------------------------------------------------------------------------

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore, ROLE_LABELS } from '../store/authStore.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { api } from '../lib/api.js';
import { useQueryClient } from '@tanstack/react-query';

function Nav({ role }) {
  // Each entry: { to, label }.
  // Order matters: the first entry is the "home" of the dashboard.
  const all = [
    { to: '/dashboard',     label: 'Dashboard',  roles: ['admin', 'doctor', 'receptionist', 'lab', 'patient'] },
    { to: '/patients',      label: 'Patients',   roles: ['admin', 'doctor', 'receptionist'] },
    { to: '/doctors',       label: 'Doctors',    roles: ['admin', 'receptionist', 'patient'] },
    { to: '/appointments',  label: 'Appointments', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
    { to: '/queue',         label: 'Queue',      roles: ['admin', 'doctor', 'receptionist'] },
    { to: '/lab',           label: 'Lab',        roles: ['admin', 'doctor', 'lab'] },
    { to: '/invoices',      label: 'Invoices',   roles: ['admin', 'receptionist'] },
    { to: '/search',        label: 'Search',     roles: ['admin', 'doctor', 'receptionist', 'lab'] },
    { to: '/admin/users',   label: 'Users',      roles: ['admin'] },
    { to: '/admin/audit',   label: 'Audit log',  roles: ['admin'] },
    { to: '/admin/services',label: 'Catalog',    roles: ['admin'] },
  ];
  return all
    .filter((item) => item.roles.includes(role))
    .map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          'nav-link' + (isActive ? ' nav-link-active' : '')
        }
      >
        {item.label}
      </NavLink>
    ));
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const q = useNotifications();
  const items = q.data?.items || [];
  const unread = q.data?.unreadCount || 0;

  async function markRead(id) {
    await api.post('/api/notifications/' + id + '/read');
    q.refetch();
  }
  async function markAllRead() {
    await api.post('/api/notifications/read-all');
    q.refetch();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-outline btn-sm relative"
      >
        Notifications
        {unread > 0 ? (
          <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-ink-800 bg-ink-50 px-1 text-[10px] font-semibold text-ink-900">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-md border border-ink-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-ink-200 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Notifications
            </span>
            <button
              onClick={markAllRead}
              className="text-xs text-ink-500 hover:text-ink-900"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-400">No notifications.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={
                    'block w-full border-b border-ink-100 px-3 py-2 text-left text-sm hover:bg-ink-50 ' +
                    (n.readAt ? 'text-ink-500' : 'text-ink-900')
                  }
                >
                  <div className="font-medium">{n.title}</div>
                  {n.body ? <div className="text-xs text-ink-500">{n.body}</div> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  function handleLogout() {
    logout();
    qc.clear();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-ink-200 bg-white p-4 md:block">
        <Link to="/dashboard" className="mb-6 block">
          <div className="h-display text-xl font-semibold text-ink-900">MedAssist</div>
          <div className="text-xs text-ink-500">Clinic operations</div>
        </Link>
        <nav className="space-y-1">
          <Nav role={user?.role} />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3">
          <div className="md:hidden">
            <span className="h-display text-lg font-semibold text-ink-900">MedAssist</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <div className="text-right">
              <div className="text-sm font-medium text-ink-900">{user?.name}</div>
              <div className="text-xs text-ink-500">
                {ROLE_LABELS[user?.role] || user?.role}
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

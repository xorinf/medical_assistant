// components/AppShell.jsx
// -----------------------------------------------------------------------------
// Unified Clinic Application Shell: Responsive Sidebar + Top Header
// Features: Clean solid colors (zero gradients), live DB health indicator,
// role-based navigation with SVG icons, notifications drawer, and 1-click role switcher.
// -----------------------------------------------------------------------------

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore, ROLE_LABELS } from '../store/authStore.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { api } from '../lib/api.js';
import { useQueryClient } from '@tanstack/react-query';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    roles: ['admin', 'doctor', 'receptionist', 'lab', 'patient'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/patients',
    label: 'Patients',
    roles: ['admin', 'doctor', 'receptionist'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    to: '/doctors',
    label: 'Doctors',
    roles: ['admin', 'receptionist', 'patient'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: '/appointments',
    label: 'Appointments',
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/queue',
    label: 'Live Queue',
    roles: ['admin', 'doctor', 'receptionist'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/lab',
    label: 'Lab Orders',
    roles: ['admin', 'doctor', 'lab'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    to: '/invoices',
    label: 'Billing & Invoices',
    roles: ['admin', 'receptionist'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Search Clinic',
    roles: ['admin', 'doctor', 'receptionist', 'lab'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'User Management',
    roles: ['admin'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/audit',
    label: 'Audit Log',
    roles: ['admin'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/services',
    label: 'Service Catalog',
    roles: ['admin'],
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

const DEMO_USERS = [
  { role: 'admin', label: 'Admin (Ada)', email: 'ada.admin+admin@medassist.dev' },
  { role: 'doctor', label: 'Doctor (Dr. Aryan)', email: 'dr..aryan.mehta+doctor@medassist.dev' },
  { role: 'receptionist', label: 'Desk (Riya)', email: 'riya.reception+receptionist@medassist.dev' },
  { role: 'lab', label: 'Lab (Lavanya)', email: 'lab.lavanya+lab@medassist.dev' },
  { role: 'patient', label: 'Patient (Aarav)', email: 'aarav.sharma+patient@medassist.dev' },
];

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
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-subtle">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-elevated">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Clinic Notifications ({unread} new)
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                Mark read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">All caught up! No notifications.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`block w-full p-3 text-left text-xs transition-colors hover:bg-slate-50 ${
                    n.readAt ? 'text-slate-500' : 'bg-brand-50/40 text-slate-900 font-medium'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-slate-500 line-clamp-2">{n.body}</div>}
                  <div className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
  const { user, logout, login } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');

  // Check DB status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setDbStatus(data.ok ? 'up' : 'down'))
      .catch(() => setDbStatus('down'));
  }, []);

  function handleLogout() {
    logout();
    qc.clear();
    navigate('/');
  }

  async function handleSwitchRole(email) {
    if (email === user?.email) return;
    try {
      await login(email, 'password123');
      qc.clear();
      navigate('/dashboard');
    } catch (e) {
      console.error('Role switch failed:', e);
    }
  }

  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        {/* Brand */}
        <div className="border-b border-slate-200 p-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white shadow-subtle font-bold">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900 leading-none">MedAssist</div>
              <div className="text-[11px] font-medium text-slate-500 mt-1">Clinic Operations Portal</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {allowedNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Database Health Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/60">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  dbStatus === 'up'
                    ? 'bg-emerald-500'
                    : dbStatus === 'down'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-slate-600">
                {dbStatus === 'up' ? 'Atlas DB Active' : dbStatus === 'down' ? 'DB Offline' : 'Connecting DB…'}
              </span>
            </div>
            <Link to="/" className="text-slate-400 hover:text-slate-700 text-[11px]">
              Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-display text-lg font-bold text-slate-900">MedAssist</span>
          </div>

          {/* Role Switcher Pill Bar (Header Quick-Switch) */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <span className="px-2 font-bold text-slate-500 uppercase text-[10px]">Test Role:</span>
            {DEMO_USERS.map((u) => {
              const active = user?.email === u.email;
              return (
                <button
                  key={u.role}
                  onClick={() => handleSwitchRole(u.email)}
                  className={`rounded-md px-2 py-1 font-semibold transition-all ${
                    active
                      ? 'bg-brand-700 text-white shadow-subtle'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {u.label}
                </button>
              );
            })}
          </div>

          {/* Right Header Controls */}
          <div className="ml-auto flex items-center gap-3.5">
            <NotificationBell />

            {/* User Profile Tag */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-900 border border-brand-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</div>
                <div className="text-[11px] font-semibold text-brand-700">
                  {ROLE_LABELS[user?.role] || user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm text-xs"
              title="Sign out"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white p-4 md:hidden space-y-1">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</div>
            {allowedNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Switch Test Role</div>
              <div className="flex flex-wrap gap-1">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.role}
                    onClick={() => {
                      handleSwitchRole(u.email);
                      setMobileMenuOpen(false);
                    }}
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      user?.email === u.email ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {u.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

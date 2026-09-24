// App.jsx
// -----------------------------------------------------------------------------
// Top-level router. Public routes (/login, /register) + protected routes
// wrapped in AppShell. /api/printable/* still works because the browser
// loads those URLs directly with the JWT in a header (handled by the
// printable endpoints being auth-protected server-side too).
// -----------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppShell from './components/AppShell.jsx';
import { RequireAuth, RequireRole } from './components/RequireAuth.jsx';
import { ROLES, useAuthStore } from './store/authStore.js';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import PatientTimelinePage from './pages/PatientTimelinePage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import QueuePage from './pages/QueuePage.jsx';
import LabPage from './pages/LabPage.jsx';
import InvoicesPage from './pages/InvoicesPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import NewNotePage from './pages/NewNotePage.jsx';
import NewPrescriptionPage from './pages/NewPrescriptionPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAuditPage from './pages/AdminAuditPage.jsx';
import AdminCatalogPage from './pages/AdminCatalogPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

function RefreshOnMount() {
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (token) refreshMe();
  }, [token, refreshMe]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RefreshOnMount />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/dashboard"             element={<DashboardPage />} />
            <Route path="/patients"              element={<PatientsPage />} />
            <Route path="/patients/:id"          element={<PatientTimelinePage />} />
            <Route path="/doctors"               element={<DoctorsPage />} />
            <Route path="/appointments"          element={<AppointmentsPage />} />
            <Route path="/queue"                 element={<QueuePage />} />
            <Route path="/lab"                   element={<LabPage />} />
            <Route path="/invoices"              element={<InvoicesPage />} />
            <Route path="/search"                element={<SearchPage />} />
            <Route path="/notes/new"             element={<NewNotePage />} />
            <Route path="/prescriptions/new"     element={<NewPrescriptionPage />} />

            <Route
              path="/admin/users"
              element={
                <RequireRole roles={[ROLES.ADMIN]}>
                  <AdminUsersPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RequireRole roles={[ROLES.ADMIN]}>
                  <AdminAuditPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/services"
              element={
                <RequireRole roles={[ROLES.ADMIN]}>
                  <AdminCatalogPage />
                </RequireRole>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

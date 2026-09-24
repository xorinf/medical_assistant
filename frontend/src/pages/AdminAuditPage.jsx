// pages/AdminAuditPage.jsx
// -----------------------------------------------------------------------------
// Read-only view of the last 500 audit log entries.
// -----------------------------------------------------------------------------

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Spinner } from '../components/UI.jsx';

export default function AdminAuditPage() {
  const q = useQuery({ queryKey: ['admin-audit'], queryFn: () => api.get('/api/admin/audit') });
  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];
  return (
    <>
      <PageHeader title="Audit log" subtitle="Last 500 actions, newest first." />
      <div className="card overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id}>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{a.actorEmail || '—'}</td>
                <td>{a.role || '—'}</td>
                <td className="font-mono text-xs">{a.action}</td>
                <td>{a.entity || '—'} {a.entityId ? '· ' + a.entityId.slice(-6) : ''}</td>
                <td className="text-ink-500">{a.ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

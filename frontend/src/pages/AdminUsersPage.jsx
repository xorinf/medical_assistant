// pages/AdminUsersPage.jsx
// -----------------------------------------------------------------------------
// Admin lists all users + can disable / enable them.
// -----------------------------------------------------------------------------

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Spinner, Pill } from '../components/UI.jsx';
import { ROLE_LABELS } from '../store/authStore.js';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/api/admin/users') });

  const setActive = useMutation({
    mutationFn: ({ id, active }) => api.patch('/api/admin/users/' + id + (active ? '/enable' : '/disable')),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone with access to MedAssist." />
      <div className="card overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id}>
                <td className="font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td><Pill>{ROLE_LABELS[u.role] || u.role}</Pill></td>
                <td>
                  {u.isActive ? <Pill>active</Pill> : <Pill>disabled</Pill>}
                </td>
                <td>
                  {u.isActive ? (
                    <button
                      onClick={() => setActive.mutate({ id: u._id, active: false })}
                      className="btn btn-outline btn-sm"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={() => setActive.mutate({ id: u._id, active: true })}
                      className="btn btn-primary btn-sm"
                    >
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

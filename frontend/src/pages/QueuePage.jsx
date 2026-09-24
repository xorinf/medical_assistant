// pages/QueuePage.jsx
// -----------------------------------------------------------------------------
// Today's queue (all doctors). Reception / doctor can check patients in.
// -----------------------------------------------------------------------------

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Spinner, StatusPill, EmptyState } from '../components/UI.jsx';

export default function QueuePage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['queue-today'],
    queryFn: () => api.get('/api/queue/today'),
  });

  const checkIn = useMutation({
    mutationFn: (id) => api.post('/api/queue/check-in/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue-today'] }),
  });
  const start = useMutation({
    mutationFn: (id) => api.post('/api/queue/start-consult/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue-today'] }),
  });
  const complete = useMutation({
    mutationFn: (id) => api.post('/api/queue/complete/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue-today'] }),
  });

  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];

  return (
    <>
      <PageHeader title="Today's queue" subtitle="Patients waiting to be seen." />
      {items.length === 0 ? (
        <EmptyState title="Queue is empty" hint="Patients will appear here when checked in." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td>{a.queuePosition || '—'}</td>
                  <td>{a.patient?.name || '—'}</td>
                  <td>{a.doctor?.name || '—'}</td>
                  <td>{new Date(a.scheduledAt).toLocaleTimeString()}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td className="space-x-1">
                    {a.status === 'scheduled' ? (
                      <button
                        onClick={() => checkIn.mutate(a._id)}
                        className="btn btn-outline btn-sm"
                      >
                        Check in
                      </button>
                    ) : null}
                    {a.status === 'checked_in' ? (
                      <button
                        onClick={() => start.mutate(a._id)}
                        className="btn btn-outline btn-sm"
                      >
                        Start consult
                      </button>
                    ) : null}
                    {a.status === 'in_consult' ? (
                      <button
                        onClick={() => complete.mutate(a._id)}
                        className="btn btn-outline btn-sm"
                      >
                        Complete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

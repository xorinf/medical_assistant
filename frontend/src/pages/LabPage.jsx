// pages/LabPage.jsx
// -----------------------------------------------------------------------------
// Lab orders with state-transition buttons.
// -----------------------------------------------------------------------------

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Spinner, StatusPill, EmptyState } from '../components/UI.jsx';

const NEXT = {
  ordered:          { label: 'Sample collected', status: 'sample_collected' },
  sample_collected: { label: 'Processing',       status: 'processing' },
  processing:       { label: 'Verify',           status: 'verified' },
  verified:         { label: 'Release',          status: 'released' },
};

export default function LabPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['lab-orders'],
    queryFn: () => api.get('/api/lab/orders'),
  });
  const transition = useMutation({
    mutationFn: ({ id, status }) => api.patch('/api/lab/orders/' + id + '/status', { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-orders'] }),
  });

  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];

  return (
    <>
      <PageHeader title="Lab orders" subtitle="All orders across the clinic." />
      {items.length === 0 ? (
        <EmptyState title="No lab orders" />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Tests</th>
                <th>Priority</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const next = NEXT[o.status];
                return (
                  <tr key={o._id}>
                    <td>{o.patient?.name || '—'}</td>
                    <td>{o.tests?.join(', ')}</td>
                    <td><span className="pill">{o.priority}</span></td>
                    <td><StatusPill status={o.status} /></td>
                    <td>
                      {next ? (
                        <button
                          onClick={() => transition.mutate({ id: o._id, status: next.status })}
                          className="btn btn-outline btn-sm"
                        >
                          {next.label}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

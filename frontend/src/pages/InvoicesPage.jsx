// pages/InvoicesPage.jsx
// -----------------------------------------------------------------------------
// List of invoices. Reception can record payments. Both can open the
// printable view (in a new tab) for a clean printout.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import {
  PageHeader, Spinner, StatusPill, EmptyState, Modal, Field, Money, ErrorBanner,
} from '../components/UI.jsx';

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [active, setActive] = useState(null);

  const q = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/api/invoices'),
  });

  const pay = useMutation({
    mutationFn: ({ id, amount, method }) =>
      api.post('/api/invoices/' + id + '/pay', { amount: Number(amount), method }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setPayOpen(false);
      setActive(null);
    },
  });

  if (q.isLoading) return <Spinner />;
  const items = q.data?.items || [];

  return (
    <>
      <PageHeader title="Invoices" subtitle="All bills issued at the clinic." />
      {items.length === 0 ? (
        <EmptyState title="No invoices" />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td className="font-mono text-xs">{i._id.slice(-6)}</td>
                  <td>{i.patient?.name || '—'}</td>
                  <td><Money value={i.totalAmount} /></td>
                  <td><Money value={i.paidAmount} /></td>
                  <td><StatusPill status={i.status} /></td>
                  <td className="space-x-1">
                    <a
                      href={'/api/printable/invoice/' + i._id}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      Print
                    </a>
                    {i.status !== 'paid' ? (
                      <button
                        onClick={() => { setActive(i); setPayOpen(true); }}
                        className="btn btn-primary btn-sm"
                      >
                        Record payment
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={payOpen}
        title={'Record payment — #' + (active?._id || '').slice(-6)}
        onClose={() => { setPayOpen(false); setActive(null); }}
        footer={
          <>
            <button onClick={() => { setPayOpen(false); setActive(null); }} className="btn btn-outline">
              Cancel
            </button>
            <button
              form="pay-form"
              type="submit"
              disabled={pay.isPending}
              className="btn btn-primary"
            >
              {pay.isPending ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <PayForm
          invoice={active}
          onSubmit={(values) => pay.mutate({ id: active._id, ...values })}
          error={pay.error}
        />
      </Modal>
    </>
  );
}

function PayForm({ invoice, onSubmit, error }) {
  const [amount, setAmount] = useState(invoice ? invoice.totalAmount - (invoice.paidAmount || 0) : 0);
  const [method, setMethod] = useState('cash');
  return (
    <form id="pay-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ amount, method }); }} className="space-y-3">
      <ErrorBanner error={error} />
      <Field label={'Amount (balance: ' + (invoice ? (invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2) : '0') + ')'} >
        <input
          className="input"
          type="number"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <Field label="Method">
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="other">Other</option>
        </select>
      </Field>
    </form>
  );
}

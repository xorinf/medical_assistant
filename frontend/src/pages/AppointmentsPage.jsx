// pages/AppointmentsPage.jsx
// -----------------------------------------------------------------------------
// List of appointments + create form. The patient picker is a <select>
// driven by the patient list — fine for the capstone demo, swap to a
// typeahead when the patient count grows.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Modal, Field, Spinner, EmptyState, ErrorBanner, StatusPill } from '../components/UI.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function AppointmentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['appointments'],
    queryFn: () => api.get('/api/appointments'),
  });

  const cancel = useMutation({
    mutationFn: (id) => api.post('/api/appointments/' + id + '/cancel'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  if (list.isLoading) return <Spinner />;
  const items = list.data?.items || [];

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Scheduled visits across the clinic."
        actions={
          role !== 'lab' && role !== null ? (
            <button onClick={() => setOpen(true)} className="btn btn-primary">Book appointment</button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState title="No appointments" hint="Book one to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>When</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td>{new Date(a.scheduledAt).toLocaleString()}</td>
                  <td>{a.patient?.name || '—'}</td>
                  <td>{a.doctor?.name || '—'}</td>
                  <td>{a.reason || '—'}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td>
                    {a.status !== 'cancelled' && a.status !== 'completed' ? (
                      <button
                        onClick={() => {
                          if (confirm('Cancel this appointment?')) cancel.mutate(a._id);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
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
        open={open}
        title="Book appointment"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
            <button
              form="appt-form"
              type="submit"
              disabled={false}
              className="btn btn-primary"
            >
              Book
            </button>
          </>
        }
      >
        <CreateAppointmentForm onSuccess={() => { qc.invalidateQueries({ queryKey: ['appointments'] }); setOpen(false); }} />
      </Modal>
    </>
  );
}

function CreateAppointmentForm({ onSuccess }) {
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const patients = useQuery({ queryKey: ['patients'], queryFn: () => api.get('/api/patients') });
  const doctors  = useQuery({ queryKey: ['doctors'],  queryFn: () => api.get('/api/doctors') });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api.post('/api/appointments', {
        patient, doctor,
        scheduledAt: when,
        reason,
      });
      onSuccess();
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id="appt-form" onSubmit={submit} className="space-y-3">
      <ErrorBanner error={err} />
      <Field label="Patient">
        <select className="input" required value={patient} onChange={(e) => setPatient(e.target.value)}>
          <option value="">Select…</option>
          {(patients.data?.items || []).map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Doctor">
        <select className="input" required value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          <option value="">Select…</option>
          {(doctors.data?.items || []).map((d) => (
            <option key={d._id} value={d._id}>{d.name} — {d.specialization || 'general'}</option>
          ))}
        </select>
      </Field>
      <Field label="When">
        <input className="input" type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} />
      </Field>
      <Field label="Reason">
        <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      {busy ? <Spinner /> : null}
    </form>
  );
}

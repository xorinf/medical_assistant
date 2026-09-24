// pages/DoctorsPage.jsx
// -----------------------------------------------------------------------------
// List doctors. Admin can add a new one.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Modal, Field, Spinner, EmptyState, ErrorBanner } from '../components/UI.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function DoctorsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const list = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get('/api/doctors'),
  });
  const create = useMutation({
    mutationFn: (payload) => api.post('/api/doctors', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      setOpen(false);
    },
  });
  if (list.isLoading) return <Spinner />;
  const items = list.data?.items || [];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Specialists on the clinic roster."
        actions={
          role === 'admin' ? (
            <button onClick={() => setOpen(true)} className="btn btn-primary">Add doctor</button>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No doctors yet" />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d._id}>
                  <td className="font-medium">{d.name}</td>
                  <td>{d.department || '—'}</td>
                  <td>{d.specialization || '—'}</td>
                  <td>₹{Number(d.consultationFee || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title="Add doctor"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
            <button
              form="create-doctor-form"
              type="submit"
              disabled={create.isPending}
              className="btn btn-primary"
            >
              {create.isPending ? <Spinner /> : null}
              Create
            </button>
          </>
        }
      >
        <CreateDoctorForm onSubmit={(v) => create.mutate(v)} error={create.error} />
      </Modal>
    </>
  );
}

function CreateDoctorForm({ onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [fee, setFee] = useState(500);
  return (
    <form
      id="create-doctor-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name, email, password,
          department, specialization,
          consultationFee: Number(fee),
        });
      }}
      className="space-y-3"
    >
      <ErrorBanner error={error} />
      <Field label="Full name">
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Department">
          <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </Field>
        <Field label="Specialization">
          <input className="input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
        </Field>
        <Field label="Fee (₹)">
          <input className="input" type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
        </Field>
      </div>
    </form>
  );
}

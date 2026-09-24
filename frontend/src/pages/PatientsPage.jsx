// pages/PatientsPage.jsx
// -----------------------------------------------------------------------------
// List + create patients. Click a row to open the timeline.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Modal, Field, Spinner, ErrorBanner, EmptyState } from '../components/UI.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function PatientsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/api/patients'),
  });

  const create = useMutation({
    mutationFn: (payload) => api.post('/api/patients', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      setOpen(false);
    },
  });

  if (list.isLoading) return <Spinner />;
  const items = list.data?.items || [];

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Everyone registered at the clinic."
        actions={
          role === 'admin' || role === 'receptionist' ? (
            <button onClick={() => setOpen(true)} className="btn btn-primary">Add patient</button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState title="No patients yet" hint="Add the first one to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Blood group</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.user?.email || '—'}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.bloodGroup || '—'}</td>
                  <td>
                    <button
                      onClick={() => navigate('/patients/' + p._id)}
                      className="btn btn-outline btn-sm"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title="Add patient"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
            <button
              form="create-patient-form"
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
        <CreatePatientForm onSubmit={(values) => create.mutate(values)} error={create.error} />
      </Modal>
    </>
  );
}

function CreatePatientForm({ onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('');

  return (
    <form
      id="create-patient-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, email, password, phone, bloodGroup, gender: gender || undefined });
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
        <Field label="Phone">
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Blood group">
          <input className="input" placeholder="O+" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
        </Field>
        <Field label="Gender">
          <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
    </form>
  );
}

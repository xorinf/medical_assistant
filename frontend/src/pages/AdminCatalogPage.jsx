// pages/AdminCatalogPage.jsx
// -----------------------------------------------------------------------------
// Admin manages services + departments in one place.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Modal, Field, Spinner, Money, ErrorBanner } from '../components/UI.jsx';

export default function AdminCatalogPage() {
  return (
    <>
      <PageHeader title="Catalog" subtitle="Billable services and clinical departments." />
      <div className="grid gap-6 md:grid-cols-2">
        <ServicesPanel />
        <DepartmentsPanel />
      </div>
    </>
  );
}

function ServicesPanel() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-services'], queryFn: () => api.get('/api/admin/services') });
  const create = useMutation({
    mutationFn: (v) => api.post('/api/admin/services', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('consultation');

  if (q.isLoading) return <Spinner />;
  return (
    <div className="card card-pad">
      <h3 className="h-display text-base font-semibold text-ink-900">Services</h3>
      <form
        onSubmit={(e) => { e.preventDefault(); create.mutate({ name, price: Number(price), category }); setName(''); setPrice(0); }}
        className="mt-3 grid grid-cols-3 gap-2"
      >
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" type="number" min="0" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="consultation">consultation</option>
          <option value="lab">lab</option>
          <option value="procedure">procedure</option>
          <option value="other">other</option>
        </select>
        <button type="submit" className="btn btn-primary col-span-3">Add service</button>
        <ErrorBanner error={create.error} />
      </form>
      <ul className="mt-4 divide-y divide-ink-100 text-sm">
        {(q.data?.items || []).map((s) => (
          <li key={s._id} className="flex items-center justify-between py-2">
            <span>{s.name} · <span className="text-ink-500">{s.category}</span></span>
            <Money value={s.price} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DepartmentsPanel() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-departments'], queryFn: () => api.get('/api/admin/departments') });
  const create = useMutation({
    mutationFn: (v) => api.post('/api/admin/departments', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-departments'] }),
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (q.isLoading) return <Spinner />;
  return (
    <div className="card card-pad">
      <h3 className="h-display text-base font-semibold text-ink-900">Departments</h3>
      <form
        onSubmit={(e) => { e.preventDefault(); create.mutate({ name, description }); setName(''); setDescription(''); }}
        className="mt-3 space-y-2"
      >
        <Field label="Name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Description">
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <button type="submit" className="btn btn-primary w-full">Add department</button>
        <ErrorBanner error={create.error} />
      </form>
      <ul className="mt-4 divide-y divide-ink-100 text-sm">
        {(q.data?.items || []).map((d) => (
          <li key={d._id} className="py-2">
            <div className="font-medium">{d.name}</div>
            {d.description ? <div className="text-ink-500">{d.description}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

// pages/SearchPage.jsx
// -----------------------------------------------------------------------------
// Cross-entity search (patients + appointments). Debounced typing.
// -----------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { PageHeader, Spinner, EmptyState, Field } from '../components/UI.jsx';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  const res = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => api.get('/api/search?q=' + encodeURIComponent(debounced)),
    enabled: debounced.length >= 2,
  });

  return (
    <>
      <PageHeader title="Search" subtitle="Patients and appointments in one shot." />
      <div className="card card-pad mb-6">
        <Field label="Query">
          <input
            className="input"
            placeholder="Name, phone, blood group, reason…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
      </div>

      {debounced.length < 2 ? (
        <p className="text-sm text-ink-500">Type at least two characters.</p>
      ) : res.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="card card-pad">
            <h3 className="h-display text-base font-semibold text-ink-900">Patients</h3>
            {res.data?.patients?.length ? (
              <ul className="mt-2 divide-y divide-ink-100">
                {res.data.patients.map((p) => (
                  <li key={p._id} className="flex items-center justify-between py-2 text-sm">
                    <span>{p.name} · {p.phone || '—'}</span>
                    <Link to={'/patients/' + p._id} className="btn btn-outline btn-sm">Open</Link>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No patient matches" />}
          </div>

          <div className="card card-pad">
            <h3 className="h-display text-base font-semibold text-ink-900">Appointments</h3>
            {res.data?.appointments?.length ? (
              <ul className="mt-2 divide-y divide-ink-100">
                {res.data.appointments.map((a) => (
                  <li key={a._id} className="flex items-center justify-between py-2 text-sm">
                    <span>{new Date(a.scheduledAt).toLocaleString()} · {a.reason || '—'}</span>
                    <span className="text-ink-500">{a.patient?.name || ''}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No appointment matches" />}
          </div>
        </div>
      )}
    </>
  );
}

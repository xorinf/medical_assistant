// pages/PatientTimelinePage.jsx
// -----------------------------------------------------------------------------
// One patient's full history: appointments, notes, prescriptions, lab, invoices.
// Each section has a quick action button (e.g. add a note, prescribe, order lab).
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import {
  PageHeader, Spinner, ErrorBanner, EmptyState, StatusPill, Pill, Field, Money, DateText,
} from '../components/UI.jsx';

export default function PatientTimelinePage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const t = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => api.get('/api/timeline/' + id),
  });

  const sumNote = useMutation({
    mutationFn: (noteId) => api.post('/api/notes/' + noteId + '/summarize'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline', id] }),
  });
  const explainRx = useMutation({
    mutationFn: (rxId) => api.post('/api/prescriptions/' + rxId + '/explain'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline', id] }),
  });

  if (t.isLoading) return <Spinner />;
  if (t.error) return <ErrorBanner error={t.error} />;
  const tl = t.data?.timeline || {};
  const patient = (tl.notes?.[0] && null) || (tl.appointments?.[0] && null); // not needed; patient name shown elsewhere
  const appts = tl.appointments || [];
  const notes = tl.notes || [];
  const rx = tl.prescriptions || [];
  const lab = tl.labOrders || [];
  const inv = tl.invoices || [];

  return (
    <>
      <PageHeader
        title="Patient timeline"
        subtitle="Everything for this patient in one place."
        actions={
          <Link to="/patients" className="btn btn-outline btn-sm">Back</Link>
        }
      />

      <div className="space-y-6">
        <Section title="Appointments" emptyText="No visits yet.">
          {appts.map((a) => (
            <Row
              key={a._id}
              left={new Date(a.scheduledAt).toLocaleString()}
              mid={a.reason || '—'}
              right={<StatusPill status={a.status} />}
            />
          ))}
        </Section>

        <Section
          title="Medical notes"
          emptyText="No notes yet."
          action={<Link to={`/notes/new?patient=${id}`} className="btn btn-outline btn-sm">Add note</Link>}
        >
          {notes.map((n) => (
            <div key={n._id} className="border-b border-ink-100 py-3 last:border-b-0">
              <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => sumNote.mutate(n._id)}
                  disabled={sumNote.isPending}
                  className="btn btn-outline btn-sm"
                >
                  {sumNote.isPending ? 'Working…' : 'AI summary'}
                </button>
              </div>
              {n.summary ? (
                <div className="rounded-md border border-ink-200 bg-ink-50 p-3 text-sm whitespace-pre-line text-ink-800">
                  {n.summary}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="label">Subjective</span><div>{n.subjective || '—'}</div></div>
                  <div><span className="label">Objective</span><div>{n.objective || '—'}</div></div>
                  <div><span className="label">Assessment</span><div>{n.assessment || '—'}</div></div>
                  <div><span className="label">Plan</span><div>{n.plan || '—'}</div></div>
                </div>
              )}
            </div>
          ))}
        </Section>

        <Section
          title="Prescriptions"
          emptyText="No prescriptions yet."
          action={<Link to={`/prescriptions/new?patient=${id}`} className="btn btn-outline btn-sm">New Rx</Link>}
        >
          {rx.map((r) => (
            <div key={r._id} className="border-b border-ink-100 py-3 last:border-b-0">
              <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                <span>{new Date(r.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => explainRx.mutate(r._id)}
                  disabled={explainRx.isPending}
                  className="btn btn-outline btn-sm"
                >
                  {explainRx.isPending ? 'Working…' : 'Explain in plain language'}
                </button>
              </div>
              <ul className="mb-2 space-y-1 text-sm">
                {r.medications?.map((m, i) => (
                  <li key={i}>
                    <strong>{m.name}</strong> · {m.dosage} · {m.frequency} · {m.duration}
                  </li>
                ))}
              </ul>
              {r.plainLanguage ? (
                <div className="rounded-md border border-ink-200 bg-ink-50 p-3 text-sm whitespace-pre-line text-ink-800">
                  {r.plainLanguage}
                </div>
              ) : null}
            </div>
          ))}
        </Section>

        <Section title="Lab orders" emptyText="No lab orders yet.">
          {lab.map((o) => (
            <Row
              key={o._id}
              left={o.tests?.join(', ')}
              mid={new Date(o.createdAt).toLocaleDateString()}
              right={<StatusPill status={o.status} />}
            />
          ))}
        </Section>

        <Section title="Invoices" emptyText="No invoices yet.">
          {inv.map((i) => (
            <Row
              key={i._id}
              left={'#' + i._id.slice(-6)}
              mid={<Money value={i.totalAmount} />}
              right={<StatusPill status={i.status} />}
            />
          ))}
        </Section>
      </div>
    </>
  );
}

function Section({ title, emptyText, action, children }) {
  const kids = Array.isArray(children) ? children : [children];
  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="h-display text-base font-semibold text-ink-900">{title}</h2>
        {action}
      </div>
      {kids.length === 0 ? (
        <p className="text-sm text-ink-500">{emptyText}</p>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

function Row({ left, mid, right }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2 text-sm last:border-b-0">
      <span className="font-medium">{left}</span>
      <span className="text-ink-500">{mid}</span>
      <span>{right}</span>
    </div>
  );
}

// keep Money available so we don't tree-shake it on this page
export { Money, Pill, DateText };

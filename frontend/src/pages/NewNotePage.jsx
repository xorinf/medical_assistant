// pages/NewNotePage.jsx
// -----------------------------------------------------------------------------
// Doctor creates a SOAP note. ?patient=<id> pre-fills the patient picker.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Field, Spinner, ErrorBanner } from '../components/UI.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function NewNotePage() {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const [params] = useSearchParams();
  const [patient, setPatient] = useState(params.get('patient') || '');
  const [appointment, setAppointment] = useState('');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  // Resolve the doctor's profile id (needed by the backend schema).
  const doctorQ = useQuery({
    queryKey: ['doctor-mine'],
    queryFn: () => api.get('/api/doctors').then((r) => {
      const me2 = r.items?.find((d) => d.user?._id === me?._id || d.user?.email === me?.email);
      return me2;
    }),
    enabled: me?.role === 'doctor',
  });

  const patients = useQuery({ queryKey: ['patients'], queryFn: () => api.get('/api/patients') });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api.post('/api/notes', {
        patient,
        doctor: doctorQ.data?._id,
        appointment: appointment || undefined,
        subjective, objective, assessment, plan,
        diagnosis: diagnosis ? diagnosis.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      navigate('/patients/' + patient);
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  if (me?.role !== 'doctor') {
    return <p className="text-sm text-ink-500">Only doctors can write notes.</p>;
  }

  return (
    <>
      <PageHeader title="New clinical note" subtitle="SOAP fields. Save, then AI-summary on the timeline." />
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner error={err} />
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Patient">
            <select className="input" required value={patient} onChange={(e) => setPatient(e.target.value)}>
              <option value="">Select…</option>
              {(patients.data?.items || []).map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Appointment ID (optional)">
            <input className="input" value={appointment} onChange={(e) => setAppointment(e.target.value)} />
          </Field>
        </div>
        <Field label="Subjective (what the patient reports)">
          <textarea className="input min-h-20" value={subjective} onChange={(e) => setSubjective(e.target.value)} />
        </Field>
        <Field label="Objective (examination, vitals)">
          <textarea className="input min-h-20" value={objective} onChange={(e) => setObjective(e.target.value)} />
        </Field>
        <Field label="Assessment">
          <textarea className="input min-h-20" value={assessment} onChange={(e) => setAssessment(e.target.value)} />
        </Field>
        <Field label="Plan">
          <textarea className="input min-h-20" value={plan} onChange={(e) => setPlan(e.target.value)} />
        </Field>
        <Field label="Diagnosis (comma-separated)">
          <input className="input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
          <button disabled={busy} type="submit" className="btn btn-primary">
            {busy ? <Spinner /> : null}
            Save note
          </button>
        </div>
      </form>
    </>
  );
}

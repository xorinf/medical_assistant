// pages/NewPrescriptionPage.jsx
// -----------------------------------------------------------------------------
// Doctor creates a prescription. ?patient=<id> pre-fills the patient picker.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHeader, Field, Spinner, ErrorBanner } from '../components/UI.jsx';
import { useAuthStore } from '../store/authStore.js';

function blankMed() {
  return { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
}

export default function NewPrescriptionPage() {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const [params] = useSearchParams();
  const [patient, setPatient] = useState(params.get('patient') || '');
  const [meds, setMeds] = useState([blankMed()]);
  const [general, setGeneral] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const doctorQ = useQuery({
    queryKey: ['doctor-mine'],
    queryFn: () => api.get('/api/doctors').then((r) =>
      r.items?.find((d) => d.user?._id === me?._id || d.user?.email === me?.email)
    ),
    enabled: me?.role === 'doctor',
  });

  const patients = useQuery({ queryKey: ['patients'], queryFn: () => api.get('/api/patients') });

  function setMed(i, key, value) {
    setMeds((arr) => arr.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const created = await api.post('/api/prescriptions', {
        patient,
        doctor: doctorQ.data?._id,
        medications: meds.filter((m) => m.name),
        generalInstructions: general || undefined,
        followUpDate: followUp || undefined,
      });
      navigate('/patients/' + patient);
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  if (me?.role !== 'doctor') {
    return <p className="text-sm text-ink-500">Only doctors can prescribe.</p>;
  }

  return (
    <>
      <PageHeader title="New prescription" subtitle="Save, then AI-explain on the timeline." />
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner error={err} />
        <Field label="Patient">
          <select className="input" required value={patient} onChange={(e) => setPatient(e.target.value)}>
            <option value="">Select…</option>
            {(patients.data?.items || []).map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label !mb-0">Medications</span>
            <button
              type="button"
              onClick={() => setMeds((arr) => [...arr, blankMed()])}
              className="btn btn-outline btn-sm"
            >
              + Add medication
            </button>
          </div>
          {meds.map((m, i) => (
            <div key={i} className="card card-pad">
              <div className="grid gap-2 md:grid-cols-5">
                <Field label="Name">
                  <input className="input" value={m.name} onChange={(e) => setMed(i, 'name', e.target.value)} />
                </Field>
                <Field label="Dosage">
                  <input className="input" value={m.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} />
                </Field>
                <Field label="Frequency">
                  <input className="input" value={m.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)} />
                </Field>
                <Field label="Duration">
                  <input className="input" value={m.duration} onChange={(e) => setMed(i, 'duration', e.target.value)} />
                </Field>
                <Field label="Instructions">
                  <input className="input" value={m.instructions} onChange={(e) => setMed(i, 'instructions', e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <Field label="General instructions">
          <textarea className="input min-h-20" value={general} onChange={(e) => setGeneral(e.target.value)} />
        </Field>
        <Field label="Follow-up date">
          <input className="input" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
          <button disabled={busy} type="submit" className="btn btn-primary">
            {busy ? <Spinner /> : null}
            Save prescription
          </button>
        </div>
      </form>
    </>
  );
}

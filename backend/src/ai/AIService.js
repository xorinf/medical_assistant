// AIService.js
// -----------------------------------------------------------------------------
// Thin layer the rest of the app uses to talk to the AI module.
//
// Controllers import summarizeVisit() and explainPrescription() from here,
// not from AIProvider directly. This keeps the controller code clean and
// lets us swap AI providers without touching the controllers.
// -----------------------------------------------------------------------------

import { summarize, explain } from './AIProvider.js';

// summarizeVisit(note)
//   Takes a MedicalNote document and asks the AI module for a structured
//   summary. We only forward the SOAP fields.
export async function summarizeVisit(note) {
  const subjective = note ? note.subjective : '';
  const objective = note ? note.objective : '';
  const assessment = note ? note.assessment : '';
  const plan = note ? note.plan : '';
  const diagnosis = note && note.diagnosis ? note.diagnosis : [];

  return summarize({
    subjective: subjective,
    objective: objective,
    assessment: assessment,
    plan: plan,
    diagnosis: diagnosis,
  });
}

// explainPrescription(rx)
//   Takes a Prescription document and asks the AI module for a
//   plain-language explainer for the patient.
export async function explainPrescription(rx) {
  const medications = rx && rx.medications ? rx.medications : [];
  const generalInstructions = rx ? rx.generalInstructions : '';
  const followUpDate = rx ? rx.followUpDate : null;

  return explain({
    medications: medications,
    generalInstructions: generalInstructions,
    followUpDate: followUpDate,
  });
}

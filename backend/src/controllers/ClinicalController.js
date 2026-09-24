// ClinicalController.js
// -----------------------------------------------------------------------------
// This controller groups all the "clinical work" endpoints:
//   - Patient timeline (notes, prescriptions, lab, invoices, appointments)
//   - Medical notes  (create + AI summary)
//   - Prescriptions  (create + AI plain-language explainer)
//   - Lab orders     (create + state transitions)
//   - Invoices       (create + record a payment)
// -----------------------------------------------------------------------------

import { z } from 'zod';
import MedicalNote from '../models/MedicalNoteModel.js';
import Prescription from '../models/PrescriptionModel.js';
import LabOrder from '../models/LabModel.js';
import Invoice from '../models/InvoiceModel.js';
import Appointment from '../models/AppointmentModel.js';
import { AppError } from '../utils/Errors.js';
import { summarizeVisit, explainPrescription } from '../ai/AIService.js';
import { logEvent } from '../utils/Audit.js';
import { notify } from '../utils/Notifications.js';

// =============================================================================
// PATIENT TIMELINE
// =============================================================================

// timeline(req, res)
//   Returns a single bundle of EVERYTHING related to one patient:
//   notes, prescriptions, lab orders, invoices, appointments.
//   Frontend typically shows this on a "Patient profile" page.
export async function timeline(req, res) {
  const patientId = req.params.id;

  // We run all 5 queries in parallel to make this endpoint fast.
  const notes = await MedicalNote.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .lean();
  const prescriptions = await Prescription.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .lean();
  const labOrders = await LabOrder.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .lean();
  const invoices = await Invoice.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .lean();
  const appointments = await Appointment.find({ patient: patientId })
    .sort({ scheduledAt: -1 })
    .lean();

  const timelineData = {
    notes: notes,
    prescriptions: prescriptions,
    labOrders: labOrders,
    invoices: invoices,
    appointments: appointments,
  };
  res.json({ timeline: timelineData });
}

// =============================================================================
// MEDICAL NOTES  +  AI SUMMARY
// =============================================================================

// NoteSchema: what the front-end must POST to create a medical note.
export const NoteSchema = z.object({
  patient: z.string(),
  doctor: z.string(),
  appointment: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
});

// createNote(req, res)
//   Doctors save a clinical note (SOAP-style fields + diagnosis list).
//   The AI summary is NOT generated here — it's a separate endpoint so we
//   don't block note creation on the AI service.
export async function createNote(req, res) {
  const data = NoteSchema.parse(req.body);
  const newNote = await MedicalNote.create(data);

  await logEvent({
    req: req,
    user: req.user,
    action: 'note.create',
    entity: 'MedicalNote',
    entityId: newNote._id,
  });

  res.status(201).json({ note: newNote });
}

// summarizeNote(req, res)
//   Generates an AI summary for an existing note. The summary is saved
//   onto the note (so the doctor doesn't need to re-run it later).
export async function summarizeNote(req, res) {
  const noteId = req.params.id;
  const note = await MedicalNote.findById(noteId);
  if (!note) {
    throw new AppError(404, 'Note not found');
  }

  const result = await summarizeVisit(note);
  const summaryText = result.summary;
  const modelName = result.model;
  const isFallback = result.fallback === true;

  note.summary = summaryText;
  note.summaryGeneratedAt = new Date();
  await note.save();

  await logEvent({
    req: req,
    user: req.user,
    action: 'note.summarize',
    entity: 'MedicalNote',
    entityId: note._id,
    meta: { model: modelName, fallback: isFallback },
  });

  res.json({ summary: summaryText, model: modelName, fallback: isFallback });
}

// =============================================================================
// PRESCRIPTIONS  +  AI PLAIN-LANGUAGE EXPLAINER
// =============================================================================

// RxSchema: what the front-end must POST to create a prescription.
export const RxSchema = z.object({
  patient: z.string(),
  doctor: z.string(),
  appointment: z.string().optional(),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string().optional(),
      frequency: z.string().optional(),
      duration: z.string().optional(),
      instructions: z.string().optional(),
    })
  ),
  generalInstructions: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
});

// createRx(req, res)
//   Doctor creates a prescription for a patient.
export async function createRx(req, res) {
  const data = RxSchema.parse(req.body);
  const newRx = await Prescription.create(data);

  await logEvent({
    req: req,
    user: req.user,
    action: 'rx.create',
    entity: 'Prescription',
    entityId: newRx._id,
  });

  res.status(201).json({ prescription: newRx });
}

// explainRx(req, res)
//   Generates a plain-language explanation of the prescription for the patient.
//   The explanation is saved onto the prescription so we don't re-run AI
//   on every page load.
export async function explainRx(req, res) {
  const rxId = req.params.id;
  const rx = await Prescription.findById(rxId);
  if (!rx) {
    throw new AppError(404, 'Prescription not found');
  }

  const out = await explainPrescription(rx);
  rx.plainLanguage = out.explanation;
  rx.plainLanguageAt = new Date();
  await rx.save();

  res.json({ explanation: out.explanation, fallback: out.fallback === true });
}

// listRx(req, res)
//   Lists prescriptions, optionally filtered by ?patient=<id>.
export async function listRx(req, res) {
  const filter = {};
  if (req.query.patient) {
    filter.patient = req.query.patient;
  }
  const items = await Prescription.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items: items });
}

// =============================================================================
// LAB ORDERS
// =============================================================================

// LabOrderSchema: what doctors POST to order a lab test.
export const LabOrderSchema = z.object({
  patient: z.string(),
  doctor: z.string(),
  appointment: z.string().optional(),
  tests: z.array(z.string()),
  priority: z.enum(['routine', 'urgent']).optional(),
  notes: z.string().optional(),
});

// ALLOWED_TRANSITIONS: which state can move to which state.
//   ordered          → sample_collected | cancelled
//   sample_collected → processing       | cancelled
//   processing       → verified         | cancelled
//   verified         → released
//   released         → (terminal)
//   cancelled        → (terminal)
const ALLOWED_TRANSITIONS = {
  ordered:          ['sample_collected', 'cancelled'],
  sample_collected: ['processing',       'cancelled'],
  processing:       ['verified',         'cancelled'],
  verified:         ['released'],
  released:         [],
  cancelled:        [],
};

// createLabOrder(req, res)
//   Doctor orders lab tests for a patient.
export async function createLabOrder(req, res) {
  const data = LabOrderSchema.parse(req.body);
  const newOrder = await LabOrder.create(data);

  await logEvent({
    req: req,
    user: req.user,
    action: 'lab.order.create',
    entity: 'LabOrder',
    entityId: newOrder._id,
  });

  res.status(201).json({ order: newOrder });
}

// transitionLab(req, res)
//   Lab tech moves an order to a new state.
//   The body must contain { status: '<new-state>' }.
export async function transitionLab(req, res) {
  const orderId = req.params.id;
  const body = req.body ? req.body : {};
  const newStatus = body.status;

  const order = await LabOrder.findById(orderId);
  if (!order) {
    throw new AppError(404, 'Lab order not found');
  }

  const currentStatus = order.status;
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ? ALLOWED_TRANSITIONS[currentStatus] : [];
  const isAllowed = allowedNext.indexOf(newStatus) !== -1;
  if (!isAllowed) {
    throw new AppError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
  }

  // Stamp the right timestamp for this transition.
  const now = new Date();
  order.status = newStatus;
  if (newStatus === 'sample_collected') order.sampleCollectedAt = now;
  if (newStatus === 'processing')       order.processedAt       = now;
  if (newStatus === 'verified')         order.verifiedAt        = now;
  if (newStatus === 'verified')         order.verifiedBy        = req.user._id;
  if (newStatus === 'released')         order.releasedAt        = now;
  await order.save();

  // Notify the patient when results are verified AND when released.
  if (newStatus === 'verified' || newStatus === 'released') {
    await notify(
      order.patient,
      'lab.' + newStatus,
      newStatus === 'verified' ? 'Lab results ready for review' : 'Lab results released',
      newStatus === 'verified'
        ? 'Your lab results are being reviewed by the doctor.'
        : 'Your lab results have been released. Open the timeline to view them.',
      { labOrderId: order._id.toString() }
    );
  }

  await logEvent({
    req: req,
    user: req.user,
    action: 'lab.transition',
    entity: 'LabOrder',
    entityId: order._id,
    meta: { status: newStatus },
  });

  res.json({ order: order });
}

// listLabOrders(_req, res)
//   Returns all lab orders, newest first.
export async function listLabOrders(_req, res) {
  const items = await LabOrder.find()
    .sort({ createdAt: -1 })
    .populate('patient doctor', 'name')
    .lean();
  res.json({ items: items });
}

// =============================================================================
// INVOICES
// =============================================================================

// InvoiceSchema: what reception POSTs to issue an invoice.
export const InvoiceSchema = z.object({
  patient: z.string(),
  appointment: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string(),
      qty: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
    })
  ),
  totalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().optional(),
});

// createInvoice(req, res)
//   Receptionist creates an invoice for a patient visit.
export async function createInvoice(req, res) {
  const data = InvoiceSchema.parse(req.body);
  const newInvoice = await Invoice.create({
    patient: data.patient,
    appointment: data.appointment,
    items: data.items,
    totalAmount: data.totalAmount,
    paidAmount: data.paidAmount === undefined ? 0 : data.paidAmount,
    issuedBy: req.user._id,
  });

  await logEvent({
    req: req,
    user: req.user,
    action: 'invoice.create',
    entity: 'Invoice',
    entityId: newInvoice._id,
  });

  res.status(201).json({ invoice: newInvoice });
}

// listInvoices(_req, res)
//   Returns all invoices, newest first.
export async function listInvoices(_req, res) {
  const items = await Invoice.find()
    .sort({ createdAt: -1 })
    .populate('patient', 'name')
    .lean();
  res.json({ items: items });
}

// payInvoice(req, res)
//   Records a payment against an invoice.
//   Body: { amount: <number>, method: '<cash|card|upi>' }
//   Status moves: unpaid → partial → paid based on the running total.
export async function payInvoice(req, res) {
  const invoiceId = req.params.id;
  const body = req.body ? req.body : {};
  const amount = body.amount;
  const method = body.method;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new AppError(404, 'Invoice not found');
  }

  const previousPaid = invoice.paidAmount ? invoice.paidAmount : 0;
  const newPaid = previousPaid + Number(amount);

  if (newPaid > invoice.totalAmount) {
    throw new AppError(400, 'Overpayment');
  }

  invoice.paidAmount = newPaid;
  invoice.paymentMethod = method;

  if (newPaid === invoice.totalAmount) {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
  } else if (newPaid > 0) {
    invoice.status = 'partial';
  } else {
    invoice.status = 'unpaid';
  }

  await invoice.save();

  await logEvent({
    req: req,
    user: req.user,
    action: 'invoice.pay',
    entity: 'Invoice',
    entityId: invoice._id,
    meta: { amount: amount, method: method },
  });

  res.json({ invoice: invoice });
}

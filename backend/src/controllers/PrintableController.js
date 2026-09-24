// PrintableController.js
// -----------------------------------------------------------------------------
// Returns an HTML page that's ready for the browser's "Print" dialog.
// No PDF library, no headless Chrome — just clean printable HTML that
// the front-end opens in a new tab and the user prints.
//
//   GET /api/printable/invoice/:id
//   GET /api/printable/prescription/:id
// -----------------------------------------------------------------------------

import Invoice from '../models/InvoiceModel.js';
import Prescription from '../models/PrescriptionModel.js';
import { AppError } from '../utils/Errors.js';

const STYLES = `
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         color: #111; max-width: 720px; margin: 32px auto; padding: 0 16px; }
  h1 { font-size: 22px; margin: 0 0 8px; letter-spacing: -0.01em; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em;
       color: #555; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; }
  th { color: #555; font-weight: 500; }
  .right { text-align: right; }
  .meta { color: #555; font-size: 13px; }
  .pill { display: inline-block; padding: 2px 8px; border: 1px solid #111; font-size: 12px;
          border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; }
  @media print { .no-print { display: none; } body { margin: 12mm; } }
`;

function wrap(title, innerHtml) {
  return (
    '<!doctype html><html><head><meta charset="utf-8"/>' +
    '<title>' + title + '</title>' +
    '<style>' + STYLES + '</style></head><body>' +
    '<div class="no-print" style="text-align:right;margin-bottom:16px;">' +
    '<button onclick="window.print()" style="padding:6px 14px;border:1px solid #111;background:white;cursor:pointer;">Print</button>' +
    '</div>' +
    innerHtml +
    '</body></html>'
  );
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function fmtMoney(n) {
  const v = Number(n || 0);
  return '₹' + v.toFixed(2);
}

// printableInvoice(req, res)
export async function printableInvoice(req, res) {
  const id = req.params.id;
  const invoice = await Invoice.findById(id).populate('patient', 'name phone email').lean();
  if (!invoice) throw new AppError(404, 'Invoice not found');

  const rows = (invoice.items || []).map(function (it) {
    const line = (it.qty || 1) * (it.unitPrice || 0);
    return '<tr>' +
      '<td>' + esc(it.description) + '</td>' +
      '<td class="right">' + (it.qty || 1) + '</td>' +
      '<td class="right">' + fmtMoney(it.unitPrice) + '</td>' +
      '<td class="right">' + fmtMoney(line) + '</td>' +
      '</tr>';
  }).join('');

  const patientName = invoice.patient ? invoice.patient.name : 'Patient';
  const status = esc(invoice.status);

  const inner =
    '<h1>MedAssist — Invoice</h1>' +
    '<div class="meta">Invoice #' + esc(invoice._id) + ' · ' +
    '<span class="pill">' + status + '</span></div>' +
    '<div class="meta" style="margin-top:8px;">For: <strong>' + esc(patientName) + '</strong></div>' +
    '<h2>Items</h2>' +
    '<table>' +
    '<thead><tr><th>Description</th><th class="right">Qty</th>' +
    '<th class="right">Unit</th><th class="right">Line</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>' +
    '<table style="margin-top:12px;">' +
    '<tr><th>Total</th><td class="right">' + fmtMoney(invoice.totalAmount) + '</td></tr>' +
    '<tr><th>Paid</th><td class="right">' + fmtMoney(invoice.paidAmount) + '</td></tr>' +
    '<tr><th>Balance</th><td class="right">' + fmtMoney(invoice.totalAmount - (invoice.paidAmount || 0)) + '</td></tr>' +
    '</table>';

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(wrap('Invoice', inner));
}

// printablePrescription(req, res)
export async function printablePrescription(req, res) {
  const id = req.params.id;
  const rx = await Prescription.findById(id)
    .populate('patient', 'name phone email dob gender bloodGroup')
    .populate('doctor', 'name specialization')
    .lean();
  if (!rx) throw new AppError(404, 'Prescription not found');

  const meds = (rx.medications || []).map(function (m) {
    return '<tr>' +
      '<td><strong>' + esc(m.name) + '</strong></td>' +
      '<td>' + esc(m.dosage || '') + '</td>' +
      '<td>' + esc(m.frequency || '') + '</td>' +
      '<td>' + esc(m.duration || '') + '</td>' +
      '<td>' + esc(m.instructions || '') + '</td>' +
      '</tr>';
  }).join('');

  const patientName = rx.patient ? rx.patient.name : 'Patient';
  const doctorName = rx.doctor ? rx.doctor.name : 'Doctor';

  const inner =
    '<h1>MedAssist — Prescription</h1>' +
    '<div class="meta">Rx #' + esc(rx._id) + '</div>' +
    '<div class="meta" style="margin-top:8px;">Patient: <strong>' + esc(patientName) + '</strong></div>' +
    '<div class="meta">Doctor: <strong>' + esc(doctorName) + '</strong>' + (rx.doctor && rx.doctor.specialization ? ' · ' + esc(rx.doctor.specialization) : '') + '</div>' +
    '<h2>Medications</h2>' +
    '<table>' +
    '<thead><tr><th>Name</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>' +
    '<tbody>' + (meds || '<tr><td colspan="5">No medications listed.</td></tr>') + '</tbody>' +
    '</table>' +
    (rx.generalInstructions
      ? '<h2>General instructions</h2><div>' + esc(rx.generalInstructions) + '</div>'
      : '') +
    (rx.followUpDate
      ? '<h2>Follow-up</h2><div>' + esc(new Date(rx.followUpDate).toDateString()) + '</div>'
      : '');

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(wrap('Prescription', inner));
}

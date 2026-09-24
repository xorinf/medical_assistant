// SearchController.js
// -----------------------------------------------------------------------------
// One endpoint: GET /api/search?q=<text>&type=<patients|appointments|all>
//   Returns best-effort matches across patients + appointments for staff.
//   No fancy full-text index — we use case-insensitive substring match
//   (regex). Fine for a capstone demo; upgrade to a $text index later.
// -----------------------------------------------------------------------------

import Patient from '../models/PatientModel.js';
import Appointment from '../models/AppointmentModel.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// search(req, res)
//   - Patients: match name, phone, email (case-insensitive substring)
//   - Appointments: match reason or populated patient/doctor name
export async function search(req, res) {
  const rawQuery = req.query.q ? String(req.query.q) : '';
  const type = req.query.type ? String(req.query.type) : 'all';

  const trimmed = rawQuery.trim();
  if (trimmed.length < 2) {
    return res.json({ patients: [], appointments: [], query: trimmed });
  }
  const safe = escapeRegex(trimmed);
  const pattern = new RegExp(safe, 'i');

  const includePatients = type === 'all' || type === 'patients';
  const includeAppointments = type === 'all' || type === 'appointments';

  let patients = [];
  let appointments = [];

  if (includePatients) {
    patients = await Patient.find({
      $or: [{ name: pattern }, { phone: pattern }, { bloodGroup: pattern }],
    })
      .limit(25)
      .populate('user', 'name email phone')
      .lean();
  }

  if (includeAppointments) {
    appointments = await Appointment.find({ reason: pattern })
      .limit(25)
      .populate('patient doctor', 'name')
      .lean();
  }

  res.json({ patients: patients, appointments: appointments, query: trimmed });
}

export const auth = authRequired;
export const staffOnly = requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.LAB);

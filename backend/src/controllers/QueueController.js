// QueueController.js
// -----------------------------------------------------------------------------
// Patient queue at the front desk:
//   POST /api/queue/check-in/:appointmentId
//     - Marks the appointment as 'checked_in' and assigns queuePosition.
//     - queuePosition = how many active (checked_in or earlier) appointments
//       exist for that doctor today, BEFORE this one.
//   POST /api/queue/start-consult/:appointmentId
//     - Marks the appointment as 'in_consult'.
//   POST /api/queue/complete/:appointmentId
//     - Marks the appointment as 'completed'.
//   GET  /api/queue/today?doctor=<id>
//     - Lists today's queue for a given doctor (or all doctors).
// -----------------------------------------------------------------------------

import Appointment from '../models/AppointmentModel.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';
import { notify } from '../utils/Notifications.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

// checkIn(req, res)
//   1. Find the appointment.
//   2. Set status='checked_in'.
//   3. Count earlier active appointments today for the same doctor, +1.
//   4. Notify the patient that they've checked in.
export async function checkIn(req, res) {
  const apptId = req.params.appointmentId;
  const appt = await Appointment.findById(apptId);
  if (!appt) {
    throw new AppError(404, 'Appointment not found');
  }

  const doctor = appt.doctor;
  const todayStart = startOfToday();
  const tomorrowStart = startOfTomorrow();

  const aheadCount = await Appointment.countDocuments({
    doctor: doctor,
    scheduledAt: { $gte: todayStart, $lt: tomorrowStart },
    status: { $in: ['checked_in', 'in_consult'] },
    _id: { $ne: appt._id },
  });

  appt.status = 'checked_in';
  appt.queuePosition = aheadCount + 1;
  await appt.save();

  await notify(
    appt.patient,
    'queue.checked_in',
    'Checked in',
    'You are now in the queue. Position: ' + appt.queuePosition,
    { appointmentId: appt._id.toString(), queuePosition: appt.queuePosition }
  );

  await logEvent({
    req: req,
    user: req.user,
    action: 'queue.check_in',
    entity: 'Appointment',
    entityId: appt._id,
    meta: { queuePosition: appt.queuePosition },
  });

  res.json({ appointment: appt });
}

// startConsult(req, res)
export async function startConsult(req, res) {
  const apptId = req.params.appointmentId;
  const appt = await Appointment.findById(apptId);
  if (!appt) {
    throw new AppError(404, 'Appointment not found');
  }
  if (appt.status !== 'checked_in') {
    throw new AppError(400, 'Appointment must be checked_in first');
  }
  appt.status = 'in_consult';
  await appt.save();
  await logEvent({
    req: req, user: req.user,
    action: 'queue.start_consult',
    entity: 'Appointment', entityId: appt._id,
  });
  res.json({ appointment: appt });
}

// complete(req, res)
export async function complete(req, res) {
  const apptId = req.params.appointmentId;
  const appt = await Appointment.findById(apptId);
  if (!appt) {
    throw new AppError(404, 'Appointment not found');
  }
  appt.status = 'completed';
  await appt.save();

  await notify(
    appt.patient,
    'appointment.completed',
    'Visit completed',
    'Your consultation is done. Check your prescriptions and follow-up instructions.',
    { appointmentId: appt._id.toString() }
  );

  await logEvent({
    req: req, user: req.user,
    action: 'queue.complete',
    entity: 'Appointment', entityId: appt._id,
  });
  res.json({ appointment: appt });
}

// todayQueue(req, res)
//   Lists today's queue. If ?doctor=<id> is given, filter to that doctor.
export async function todayQueue(req, res) {
  const todayStart = startOfToday();
  const tomorrowStart = startOfTomorrow();
  const filter = {
    scheduledAt: { $gte: todayStart, $lt: tomorrowStart },
    status: { $in: ['scheduled', 'checked_in', 'in_consult'] },
  };
  if (req.query.doctor) {
    filter.doctor = req.query.doctor;
  }
  const items = await Appointment.find(filter)
    .sort({ queuePosition: 1, scheduledAt: 1 })
    .populate('patient doctor', 'name')
    .lean();
  res.json({ items: items });
}

export const auth = authRequired;
export const staffOnly = requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR);

// AppointmentController.js
// -----------------------------------------------------------------------------
// Appointments connect a patient with a doctor at a specific date and time.
// Each appointment has a status (scheduled → completed, or cancelled, etc.).
//
// The trickiest part of this controller is making sure the same doctor
// doesn't get double-booked at overlapping times. We do that with a helper
// function called assertNoConflict() at the top of the file.
// -----------------------------------------------------------------------------

import { z } from 'zod';
import Appointment from '../models/AppointmentModel.js';
import Patient from '../models/PatientModel.js';
import Doctor from '../models/DoctorModel.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';
import { notify } from '../utils/Notifications.js';

// CreateAppointmentSchema: shape we expect when creating an appointment.
export const CreateAppointmentSchema = z.object({
  patient: z.string(),   // the patient document id
  doctor: z.string(),     // the doctor document id
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(5).max(180).optional(),
  reason: z.string().optional(),
});

// -----------------------------------------------------------------------------
// assertNoConflict(doctor, scheduledAt, durationMinutes, exceptId)
//   Checks that the doctor has no other active appointment that overlaps
//   with the requested time. Throws an AppError(409) if there is a conflict.
// -----------------------------------------------------------------------------
async function assertNoConflict(doctor, scheduledAt, durationMinutes, exceptId) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  // The Mongo query:
  //   - Same doctor
  //   - The existing appointment starts BEFORE our end time
  //   - The existing appointment ends   AFTER  our start time
  //       (we compute "end" on the fly using $add on the saved durationMinutes)
  //   - Status is not 'cancelled' or 'no_show'
  //   - If we passed exceptId, exclude that id (so updates don't clash with self)
  const overlapFilter = {
    doctor: doctor,
    scheduledAt: { $lt: end },
    $expr: {
      $lt: [
        { $add: ['$scheduledAt', { $multiply: ['$durationMinutes', 60_000] }] },
        end,
      ],
    },
    status: { $nin: ['cancelled', 'no_show'] },
  };
  if (exceptId) {
    overlapFilter._id = { $ne: exceptId };
  }

  const overlap = await Appointment.findOne(overlapFilter);
  if (overlap) {
    throw new AppError(409, 'Doctor already booked for this slot');
  }
}

// Helpers used by `list` to figure out which patient/doctor belongs to
// the currently logged-in user. A patient can only see their own
// appointments; a doctor can only see their own.
async function getPatientIdForUser(userId) {
  const p = await Patient.findOne({ user: userId });
  if (p) {
    return p._id;
  }
  return null;
}
async function getDoctorIdForUser(userId) {
  const d = await Doctor.findOne({ user: userId });
  if (d) {
    return d._id;
  }
  return null;
}

// -----------------------------------------------------------------------------
// list(req, res)
//   Lists appointments. Filters:
//     - ?patient=<id>  → only that patient
//     - ?doctor=<id>   → only that doctor
//     - ?status=<x>    → only that status
//   Plus role-based visibility:
//     - patients only see their own
//     - doctors only see their own
//     - staff (admin/receptionist/lab) see everything they ask for
// -----------------------------------------------------------------------------
export async function list(req, res) {
  const filter = {};

  if (req.query.patient) {
    filter.patient = req.query.patient;
  }
  if (req.query.doctor) {
    filter.doctor = req.query.doctor;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.user.role === 'patient') {
    const myPatientId = await getPatientIdForUser(req.user._id);
    if (myPatientId) {
      filter.patient = myPatientId;
    } else {
      // no patient profile → force empty result
      filter.patient = null;
    }
  } else if (req.user.role === 'doctor') {
    const myDoctorId = await getDoctorIdForUser(req.user._id);
    if (myDoctorId) {
      filter.doctor = myDoctorId;
    } else {
      filter.doctor = null;
    }
  }

  const items = await Appointment.find(filter)
    .sort({ scheduledAt: -1 })
    .populate('patient doctor', 'name')
    .lean();
  res.json({ items: items });
}

// -----------------------------------------------------------------------------
// create(req, res)
//   Create a new appointment, after checking the doctor isn't double-booked.
// -----------------------------------------------------------------------------
export async function create(req, res) {
  // 1) parse + validate
  const data = CreateAppointmentSchema.parse(req.body);

  // 2) check for conflicts (default duration is 20 minutes)
  const duration = data.durationMinutes === undefined ? 20 : data.durationMinutes;
  await assertNoConflict(data.doctor, data.scheduledAt, duration, null);

  // 3) create the appointment
  const newAppointment = await Appointment.create({
    patient: data.patient,
    doctor: data.doctor,
    scheduledAt: data.scheduledAt,
    durationMinutes: duration,
    reason: data.reason,
    createdBy: req.user._id,
  });

  // 4) audit log
  await logEvent({
    req: req,
    user: req.user,
    action: 'appointment.create',
    entity: 'Appointment',
    entityId: newAppointment._id,
  });

  // 5) notify the patient (look up the patient's User account via patientProfile).
  const patientDoc = await Patient.findById(data.patient);
  if (patientDoc && patientDoc.user) {
    await notify(
      patientDoc.user,
      'appointment.created',
      'Appointment booked',
      'Your appointment is scheduled for ' + new Date(data.scheduledAt).toLocaleString(),
      { appointmentId: newAppointment._id.toString() }
    );
  }

  // 6) respond
  res.status(201).json({ appointment: newAppointment });
}

// -----------------------------------------------------------------------------
// update(req, res)
//   Update fields on an appointment. If the time or doctor changes, we
//   re-check for conflicts.
// -----------------------------------------------------------------------------
export async function update(req, res) {
  const appointmentId = req.params.id;

  const existing = await Appointment.findById(appointmentId);
  if (!existing) {
    throw new AppError(404, 'Appointment not found');
  }

  // If the time or doctor is changing, re-run the conflict check.
  if (req.body.scheduledAt || req.body.durationMinutes || req.body.doctor) {
    const nextDoctor = req.body.doctor ? req.body.doctor : existing.doctor;
    const nextScheduledAt = req.body.scheduledAt ? req.body.scheduledAt : existing.scheduledAt;
    const nextDuration = req.body.durationMinutes ? req.body.durationMinutes : existing.durationMinutes;
    await assertNoConflict(nextDoctor, nextScheduledAt, nextDuration, existing._id);
  }

  // Apply the new fields and save.
  Object.assign(existing, req.body);
  await existing.save();

  await logEvent({
    req: req,
    user: req.user,
    action: 'appointment.update',
    entity: 'Appointment',
    entityId: existing._id,
  });

  res.json({ appointment: existing });
}

// -----------------------------------------------------------------------------
// cancel(req, res)
//   Soft-cancel an appointment by setting its status to 'cancelled'.
// -----------------------------------------------------------------------------
export async function cancel(req, res) {
  const appointmentId = req.params.id;
  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: 'cancelled' },
    { new: true }
  );

  if (!updated) {
    throw new AppError(404, 'Appointment not found');
  }

  await logEvent({
    req: req,
    user: req.user,
    action: 'appointment.cancel',
    entity: 'Appointment',
    entityId: updated._id,
  });

  // Notify the patient that the appointment was cancelled.
  await notify(
    updated.patient,
    'appointment.cancelled',
    'Appointment cancelled',
    'Your appointment on ' + new Date(updated.scheduledAt).toLocaleString() + ' was cancelled.',
    { appointmentId: updated._id.toString() }
  );

  res.json({ appointment: updated });
}

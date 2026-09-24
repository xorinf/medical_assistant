// AdminController.js
// -----------------------------------------------------------------------------
// All admin-only endpoints:
//   - Manage services (catalog of billable items)
//   - Manage departments
//   - View the audit log
//   - View high-level clinic stats
// -----------------------------------------------------------------------------

import { z } from 'zod';
import { Service, Department } from '../models/LookupModel.js';
import AuditLog from '../models/AuditLogModel.js';
import User from '../models/UserModel.js';
import Patient from '../models/PatientModel.js';
import Doctor from '../models/DoctorModel.js';
import Appointment from '../models/AppointmentModel.js';
import LabOrder from '../models/LabModel.js';
import Invoice from '../models/InvoiceModel.js';

// ServiceSchema: what the admin POSTs to add a service to the catalog.
export const ServiceSchema = z.object({
  name: z.string(),
  category: z.enum(['consultation', 'lab', 'procedure', 'other']).optional(),
  price: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

// DepartmentSchema: what the admin POSTs to add a department.
export const DepartmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

// =============================================================================
// SERVICES
// =============================================================================

// listServices(_req, res)
//   Returns every service in the catalog.
export async function listServices(_req, res) {
  const items = await Service.find().lean();
  res.json({ items: items });
}

// createService(req, res)
//   Adds a new service to the catalog.
export async function createService(req, res) {
  const data = ServiceSchema.parse(req.body);
  const newService = await Service.create(data);
  res.status(201).json({ service: newService });
}

// =============================================================================
// DEPARTMENTS
// =============================================================================

// listDepartments(_req, res)
//   Returns every department.
export async function listDepartments(_req, res) {
  const items = await Department.find().lean();
  res.json({ items: items });
}

// createDepartment(req, res)
//   Adds a new department.
export async function createDepartment(req, res) {
  const data = DepartmentSchema.parse(req.body);
  const newDepartment = await Department.create(data);
  res.status(201).json({ department: newDepartment });
}

// =============================================================================
// AUDIT LOG
// =============================================================================

// listAudit(_req, res)
//   Returns the last 500 audit log entries, newest first.
//   (No update/delete endpoints by design — the audit log is append-only.)
export async function listAudit(_req, res) {
  const items = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  res.json({ items: items });
}

// =============================================================================
// STATS  (admin dashboard)
// =============================================================================

// stats(_req, res)
//   Returns counts of every main entity, plus today's appointment count.
export async function stats(_req, res) {
  // Run all 6 counts in parallel for speed.
  const userCount = await User.countDocuments();
  const patientCount = await Patient.countDocuments();
  const doctorCount = await Doctor.countDocuments();
  const appointmentCount = await Appointment.countDocuments();
  const labOrderCount = await LabOrder.countDocuments();
  const invoiceCount = await Invoice.countDocuments();

  // Build today [00:00, 24:00) window.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);

  const todaysAppointments = await Appointment.countDocuments({
    scheduledAt: { $gte: todayStart, $lt: tomorrowStart },
    status: { $nin: ['cancelled', 'no_show'] },
  });

  res.json({
    users: userCount,
    patients: patientCount,
    doctors: doctorCount,
    appointments: appointmentCount,
    labOrders: labOrderCount,
    invoices: invoiceCount,
    todaysAppointments: todaysAppointments,
  });
}

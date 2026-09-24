// DoctorController.js
// -----------------------------------------------------------------------------
// Doctors are the second "double-collection" model in MedAssist:
//   1. A row in the users collection   (login account, role='doctor')
//   2. A row in the doctors collection (specialty, fees, availability)
//
// This controller handles creating and listing doctors.
// -----------------------------------------------------------------------------

import { z } from 'zod';
import Doctor from '../models/DoctorModel.js';
import User from '../models/UserModel.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';

// CreateDoctorSchema: what the front-end must POST when adding a doctor.
export const CreateDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().optional(),
  specialization: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  consultationFee: z.number().nonnegative().optional(),
  availability: z
    .array(
      z.object({
        day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        start: z.string(), // '09:00'
        end: z.string(),   // '17:00'
      })
    )
    .optional(),
});

// -----------------------------------------------------------------------------
// list(_req, res)
//   Return all doctors, with their user account info attached.
// -----------------------------------------------------------------------------
export async function list(_req, res) {
  const items = await Doctor.find()
    .populate('user', 'name email phone')
    .lean();
  res.json({ items: items });
}

// -----------------------------------------------------------------------------
// create(req, res)
//   Create a new doctor. Admin only (enforced in the API file).
// -----------------------------------------------------------------------------
export async function create(req, res) {
  // 1) parse + validate
  const data = CreateDoctorSchema.parse(req.body);

  // 2) check email not already used
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError(409, 'Email already in use');
  }

  // 3) create the user account
  const passwordHash = await User.hashPassword(data.password);
  const newUser = await User.create({
    email: data.email,
    passwordHash: passwordHash,
    name: data.name,
    role: 'doctor',
  });

  // 4) build doctor fields with safe defaults
  const fee = data.consultationFee === undefined ? 0 : data.consultationFee;
  const quals = data.qualifications ? data.qualifications : [];
  const avail = data.availability ? data.availability : [];

  // 5) create the doctor profile
  const newDoctor = await Doctor.create({
    user: newUser._id,
    name: data.name,
    department: data.department,
    specialization: data.specialization,
    qualifications: quals,
    consultationFee: fee,
    availability: avail,
  });

  // 6) link the doctor profile id back to the user
  newUser.doctorProfile = newDoctor._id;
  await newUser.save();

  // 7) audit log
  await logEvent({
    req: req,
    user: req.user,
    action: 'doctor.create',
    entity: 'Doctor',
    entityId: newDoctor._id,
  });

  // 8) respond
  res.status(201).json({ doctor: newDoctor });
}

// -----------------------------------------------------------------------------
// getOne(req, res)
//   Fetch a single doctor by id.
// -----------------------------------------------------------------------------
export async function getOne(req, res) {
  const doctorId = req.params.id;
  const doctor = await Doctor.findById(doctorId)
    .populate('user', 'name email phone')
    .lean();

  if (!doctor) {
    throw new AppError(404, 'Doctor not found');
  }
  res.json({ doctor: doctor });
}

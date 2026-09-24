// PatientController.js
// -----------------------------------------------------------------------------
// Patient records in MedAssist.
//
// A "Patient" in this system is two things joined together:
//   1. A row in the users collection    (login account, role='patient')
//   2. A row in the patients collection (medical fields like blood group)
//
// Why two collections? So that login/auth and medical info don't mix.
// -----------------------------------------------------------------------------

import { z } from 'zod';
import Patient from '../models/PatientModel.js';
import User from '../models/UserModel.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';

// CreatePatientSchema: what the front-end must POST when creating a patient.
export const CreatePatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  dob: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
});

// -----------------------------------------------------------------------------
// list(_req, res)
//   Returns ALL patients, with their user account info attached.
//   Who can call it: admin, receptionist, doctor (enforced in the API file).
// -----------------------------------------------------------------------------
export async function list(_req, res) {
  const items = await Patient.find()
    .populate('user', 'name email phone')
    .lean();
  res.json({ items: items });
}

// -----------------------------------------------------------------------------
// create(req, res)
//   Create a new patient: makes BOTH a User account AND a Patient record.
// -----------------------------------------------------------------------------
export async function create(req, res) {
  // 1) parse + validate the body
  const data = CreatePatientSchema.parse(req.body);

  // 2) make sure the email isn't already in use
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
    role: 'patient',
    phone: data.phone,
  });

  // 4) build the patient record's fields, defaulting missing arrays to []
  const patientAllergies = data.allergies ? data.allergies : [];
  const patientConditions = data.chronicConditions ? data.chronicConditions : [];

  // 5) create the patient record and link it back to the user
  const newPatient = await Patient.create({
    user: newUser._id,
    name: data.name,
    phone: data.phone,
    dob: data.dob,
    gender: data.gender,
    address: data.address,
    bloodGroup: data.bloodGroup,
    allergies: patientAllergies,
    chronicConditions: patientConditions,
  });

  // 6) link the patient back to the user (so we can find it later from the user)
  newUser.patientProfile = newPatient._id;
  await newUser.save();

  // 7) audit log
  await logEvent({
    req: req,
    user: req.user,
    action: 'patient.create',
    entity: 'Patient',
    entityId: newPatient._id,
  });

  // 8) respond: merge the patient object with the safe user object
  const patientObject = newPatient.toObject();
  patientObject.user = newUser.toSafeJSON();
  res.status(201).json({ patient: patientObject });
}

// -----------------------------------------------------------------------------
// getOne(req, res)
//   Fetch a single patient by id (from the URL, e.g. /patients/123).
// -----------------------------------------------------------------------------
export async function getOne(req, res) {
  const patientId = req.params.id;
  const patient = await Patient.findById(patientId)
    .populate('user', 'name email phone')
    .lean();

  if (!patient) {
    throw new AppError(404, 'Patient not found');
  }
  res.json({ patient: patient });
}

// -----------------------------------------------------------------------------
// update(req, res)
//   Update fields on a patient record. Only the fields the front-end
//   sends will be updated (no full replacement).
// -----------------------------------------------------------------------------
export async function update(req, res) {
  const patientId = req.params.id;
  const updates = req.body ? req.body : {};

  const updatedPatient = await Patient.findByIdAndUpdate(patientId, updates, {
    new: true,
  });

  if (!updatedPatient) {
    throw new AppError(404, 'Patient not found');
  }

  await logEvent({
    req: req,
    user: req.user,
    action: 'patient.update',
    entity: 'Patient',
    entityId: updatedPatient._id,
  });

  res.json({ patient: updatedPatient });
}

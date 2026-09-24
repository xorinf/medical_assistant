// seed.js
// Seeds a clinic with users, doctors, patients, appts, lab orders, invoices,
// and notifications. Run: cd backend && npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/Database.js';
import User from '../models/UserModel.js';
import Patient from '../models/PatientModel.js';
import Doctor from '../models/DoctorModel.js';
import Appointment from '../models/AppointmentModel.js';
import MedicalNote from '../models/MedicalNoteModel.js';
import Prescription from '../models/PrescriptionModel.js';
import LabOrder from '../models/LabModel.js';
import Invoice from '../models/InvoiceModel.js';
import Notification from '../models/NotificationModel.js';
import { Service, Department } from '../models/LookupModel.js';

const NAMES = {
  admin: ['Ada Admin'],
  doctor: ['Dr. Aryan Mehta', 'Dr. Priya Rao', 'Dr. Kabir Singh'],
  receptionist: ['Riya Reception'],
  lab: ['Lab Lavanya'],
  patient: [
    'Aarav Sharma','Vihaan Verma','Ananya Iyer','Diya Nair','Arjun Kapoor',
    'Saanvi Patel','Reyansh Gupta','Aadhya Reddy','Krish Joshi','Ishaan Bhat',
  ],
};

async function clear() {
  // Hard wipe on dev only; gate by NODE_ENV when shared.
  await Promise.all([
    User.deleteMany({}), Patient.deleteMany({}), Doctor.deleteMany({}),
    Appointment.deleteMany({}), MedicalNote.deleteMany({}),
    Prescription.deleteMany({}), LabOrder.deleteMany({}),
    Invoice.deleteMany({}), Notification.deleteMany({}),
    Service.deleteMany({}), Department.deleteMany({}),
  ]);
}

async function makeUser(role, name, password = 'password123') {
  const email = `${name.toLowerCase().replace(/[^a-z]/g, '.')}+${role}@medassist.dev`;
  const hash = await User.hashPassword(password);
  return User.create({ email, passwordHash: hash, name, role });
}

async function seed() {
  await connectDB();
  console.log('[seed] connected');
  await clear();
  console.log('[seed] cleared');

  // services & departments
  await Service.insertMany([
    { name: 'General Consultation', category: 'consultation', price: 500 },
    { name: 'Specialist Consultation', category: 'consultation', price: 800 },
    { name: 'CBC', category: 'lab', price: 350 },
    { name: 'Lipid Profile', category: 'lab', price: 600 },
    { name: 'Thyroid Panel', category: 'lab', price: 900 },
  ]);
  await Department.insertMany([
    { name: 'General Medicine' },
    { name: 'Cardiology' },
    { name: 'Pediatrics' },
    { name: 'Pathology' },
  ]);

  const admin = await makeUser('admin', NAMES.admin[0]);
  const docs = await Promise.all(NAMES.doctor.map((n) => makeUser('doctor', n)));
  const reception = await makeUser('receptionist', NAMES.receptionist[0]);
  const lab = await makeUser('lab', NAMES.lab[0]);

  // doctor profiles
  const doctors = [];
  const specs = ['General Medicine', 'Cardiology', 'Pediatrics'];
  for (let i = 0; i < docs.length; i++) {
    const dp = await Doctor.create({
      user: docs[i]._id, name: NAMES.doctor[i],
      department: specs[i], specialization: specs[i],
      qualifications: ['MBBS', i > 0 ? 'MD' : ''].filter(Boolean),
      consultationFee: 500 + i * 100,
      availability: ['mon','tue','wed','thu','fri'].map((d) => ({ day: d, start: '09:00', end: '17:00' })),
    });
    docs[i].doctorProfile = dp._id; await docs[i].save();
    doctors.push(dp);
  }

  // patients
  const patientUsers = await Promise.all(NAMES.patient.map((n) => makeUser('patient', n)));
  const patients = [];
  for (let i = 0; i < patientUsers.length; i++) {
    const pp = await Patient.create({
      user: patientUsers[i]._id,
      name: NAMES.patient[i],
      phone: `+91-9000000${(100 + i).toString().padStart(4, '0')}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      dob: new Date(1980 + i, i % 12, 1 + (i % 27)),
      bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-'][i % 5],
      chronicConditions: i % 3 === 0 ? ['Hypertension'] : [],
    });
    patientUsers[i].patientProfile = pp._id; await patientUsers[i].save();
    patients.push(pp);
  }

  // a few appointments — past + future
  const today = new Date();
  function at(dayOffset, hour, minute = 0) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  const appts = [];
  for (let i = 0; i < 6; i++) {
    appts.push(await Appointment.create({
      patient: patients[i]._id,
      doctor: doctors[i % doctors.length]._id,
      scheduledAt: at(i - 2, 10 + (i % 5)),
      reason: ['Follow-up', 'Cold & cough', 'BP review', 'Annual check', 'Headache', 'Allergies'][i],
      status: i < 2 ? 'completed' : 'scheduled',
      createdBy: reception._id,
    }));
  }

  // a couple of prescriptions + lab orders + invoices for completed visits
  for (let i = 0; i < 2; i++) {
    const rx = await Prescription.create({
      patient: patients[i]._id,
      doctor: doctors[i]._id,
      appointment: appts[i]._id,
      medications: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'TDS', duration: '5 days', instructions: 'After food' },
        { name: 'Cetirizine', dosage: '10mg', frequency: 'OD', duration: '7 days', instructions: 'At night' },
      ],
      generalInstructions: 'Stay hydrated. Avoid dust.',
      followUpDate: new Date(today.getTime() + 7 * 86_400_000),
    });

    await LabOrder.create({
      patient: patients[i]._id,
      doctor: doctors[i]._id,
      appointment: appts[i]._id,
      tests: i === 0 ? ['CBC', 'Lipid Profile'] : ['Thyroid Panel'],
      priority: 'routine',
      status: i === 0 ? 'verified' : 'processing',
      verifiedBy: lab._id,
    });

    await Invoice.create({
      patient: patients[i]._id,
      appointment: appts[i]._id,
      items: [
        { description: 'Consultation', qty: 1, unitPrice: doctors[i].consultationFee },
        { description: 'Lab tests', qty: 1, unitPrice: 600 },
      ],
      totalAmount: doctors[i].consultationFee + 600,
      paidAmount: i === 0 ? doctors[i].consultationFee + 600 : 0,
      status: i === 0 ? 'paid' : 'unpaid',
      issuedBy: reception._id,
      paidAt: i === 0 ? new Date() : undefined,
      paymentMethod: i === 0 ? 'cash' : undefined,
    });
  }

  // a medical note + AI summary for the first completed visit (demo-able)
  await MedicalNote.create({
    patient: patients[0]._id,
    doctor: doctors[0]._id,
    appointment: appts[0]._id,
    subjective: 'Patient reports persistent dry cough for 5 days, mild fever on day 1, no breathlessness.',
    objective: 'Temp 37.8°C. Throat mildly congested. Chest clear on auscultation.',
    assessment: 'Likely viral upper respiratory tract infection.',
    plan: 'Symptomatic management. Paracetamol for fever. Cetirizine for nasal symptoms. Review in 7 days.',
    diagnosis: ['Viral URI'],
  });

  // a few seed notifications so the bell isn't empty on first login
  await Notification.insertMany([
    {
      userId: patientUsers[0]._id,
      kind: 'appointment.completed',
      title: 'Visit completed',
      body: 'Your consultation with ' + NAMES.doctor[0] + ' is done.',
    },
    {
      userId: patientUsers[0]._id,
      kind: 'lab.verified',
      title: 'Lab results ready',
      body: 'Your CBC and Lipid Profile results are ready for review.',
    },
    {
      userId: patientUsers[1]._id,
      kind: 'invoice.created',
      title: 'New invoice',
      body: 'Invoice issued for your visit. Please pay at reception.',
    },
    {
      userId: docs[0]._id,
      kind: 'queue.checked_in',
      title: 'Patient checked in',
      body: NAMES.patient[0] + ' has checked in for their appointment.',
    },
  ]);

  console.log('[seed] done.');
  console.log('[seed] demo login — admin:    ada.admin+admin@medassist.dev / password123');
  console.log('[seed] demo login — doctor:   dr.aryan.mehta+doctor@medassist.dev / password123');
  console.log('[seed] demo login — reception: riya.reception+receptionist@medassist.dev / password123');
  console.log('[seed] demo login — lab:      lab.lavanya+lab@medassist.dev / password123');
  console.log('[seed] demo login — patient:  aarav.sharma+patient@medassist.dev / password123');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('[seed] failed:', e);
  process.exit(1);
});

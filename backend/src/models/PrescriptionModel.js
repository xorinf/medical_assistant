import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    medications: [MedicationSchema],
    generalInstructions: String,
    followUpDate: Date,
    plainLanguage: String,         // AI-generated plain-language explainer
    plainLanguageAt: Date,
  },
  { timestamps: true, collection: 'm_assist_prescriptions' }
);

export default mongoose.model('Prescription', PrescriptionSchema);

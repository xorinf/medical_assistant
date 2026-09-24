import mongoose from 'mongoose';

const MedicalNoteSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    subjective: String,
    objective: String,
    assessment: String,
    plan: String,
    diagnosis: [String],
    summary: String,            // AI-generated clinical summary
    summaryGeneratedAt: Date,
  },
  { timestamps: true, collection: 'm_assist_medical_notes' }
);

export default mongoose.model('MedicalNote', MedicalNoteSchema);

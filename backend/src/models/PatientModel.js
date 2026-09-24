import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    dob: Date,
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    phone: String,
    address: String,
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
  },
  { timestamps: true, collection: 'm_assist_patients' }
);

export default mongoose.model('Patient', PatientSchema);

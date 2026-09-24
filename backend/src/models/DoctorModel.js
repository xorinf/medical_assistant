import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    department: String,
    specialization: String,
    qualifications: [String],
    consultationFee: { type: Number, default: 0 },
    availability: [
      {
        day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
        start: String, // '09:00'
        end: String,   // '17:00'
      },
    ],
  },
  { timestamps: true, collection: 'm_assist_doctors' }
);

export default mongoose.model('Doctor', DoctorSchema);

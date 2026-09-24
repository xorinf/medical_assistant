import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 20 },
    reason: String,
    status: {
      type: String,
      enum: ['scheduled', 'checked_in', 'in_consult', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
      index: true,
    },
    queuePosition: Number,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'm_assist_appointments' }
);

// prevent double-booking the same doctor at overlapping times
AppointmentSchema.index({ doctor: 1, scheduledAt: 1 });

export default mongoose.model('Appointment', AppointmentSchema);

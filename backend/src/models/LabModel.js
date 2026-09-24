import mongoose from 'mongoose';

const LabOrderSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    tests: [{ type: String, required: true }],
    priority: { type: String, enum: ['routine', 'urgent'], default: 'routine' },
    status: {
      type: String,
      enum: ['ordered', 'sample_collected', 'processing', 'verified', 'released', 'cancelled'],
      default: 'ordered',
      index: true,
    },
    sampleCollectedAt: Date,
    processedAt: Date,
    verifiedAt: Date,
    releasedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true, collection: 'm_assist_lab_orders' }
);

const LabResultSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'LabOrder', required: true, index: true },
    testName: { type: String, required: true },
    value: String,
    unit: String,
    referenceRange: String,
    abnormalFlag: { type: String, enum: ['', 'low', 'high', 'critical'], default: '' },
    attachmentUrl: String,
  },
  { timestamps: true, collection: 'm_assist_lab_results' }
);

const LabOrder = mongoose.model('LabOrder', LabOrderSchema);
const LabResult = mongoose.model('LabResult', LabResultSchema);
export { LabOrder, LabResult };
export default LabOrder;

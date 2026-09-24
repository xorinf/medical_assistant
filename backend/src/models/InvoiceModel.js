import mongoose from 'mongoose';

const LineItemSchema = new mongoose.Schema(
  {
    description: String,
    qty: { type: Number, default: 1 },
    unitPrice: Number,
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: [LineItemSchema],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'partial', 'paid', 'void'], default: 'unpaid', index: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidAt: Date,
    paymentMethod: String,
  },
  { timestamps: true, collection: 'm_assist_invoices' }
);

export default mongoose.model('Invoice', InvoiceSchema);

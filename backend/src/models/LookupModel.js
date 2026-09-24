import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['consultation', 'lab', 'procedure', 'other'], default: 'consultation' },
    price: Number,
    description: String,
  },
  { timestamps: true, collection: 'm_assist_services' }
);

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    headDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  },
  { timestamps: true, collection: 'm_assist_departments' }
);

export const Service = mongoose.model('Service', ServiceSchema);
export const Department = mongoose.model('Department', DepartmentSchema);

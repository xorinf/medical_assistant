import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ROLE_LIST } from '../utils/Roles.js';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ROLE_LIST },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // role-specific pointers (optional, populated for relevant roles only)
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    patientProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  },
  { timestamps: true, collection: 'm_assist_users' }
);

UserSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);
UserSchema.methods.checkPassword = (plain, hash) => bcrypt.compare(plain, hash);
UserSchema.methods.toSafeJSON = function () {
  const { passwordHash, __v, ...rest } = this.toObject();
  return rest;
};

UserSchema.statics.ROLES = ROLES;
export default mongoose.model('User', UserSchema);

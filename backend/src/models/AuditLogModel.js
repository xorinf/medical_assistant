import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: String,
    role: String,
    action: { type: String, required: true },          // e.g. 'patient.create'
    entity: String,                                    // e.g. 'Patient'
    entityId: mongoose.Schema.Types.ObjectId,
    ip: String,
    userAgent: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, collection: 'm_assist_audit_log' }
);

// append-only by convention; enforced by route guards (no update/delete endpoints)
AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);

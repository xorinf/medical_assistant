// Audit.js
// -----------------------------------------------------------------------------
// Helper for writing an "audit log" entry.
//
// Every important action in the system should call logEvent(...). The entry
// gets saved to the AuditLog collection. The audit log is APPEND-ONLY —
// there are no update/delete routes for it.
// -----------------------------------------------------------------------------

import AuditLog from '../models/AuditLogModel.js';

// logEvent({ req, user, action, entity, entityId, meta })
//   - req:    the Express request (used to grab ip + userAgent)
//   - user:   the logged-in user (may be undefined for register/login before login)
//   - action: a short string like 'auth.login' or 'patient.create'
//   - entity: the model name like 'Patient' or 'Appointment'
//   - entityId: the document id that was touched (may be undefined)
//   - meta:   an optional object with anything else worth saving
export async function logEvent({ req, user, action, entity, entityId, meta }) {
  try {
    // Read the IP and user-agent from the request, if any.
    let ip = '';
    let userAgent = '';
    if (req) {
      ip = req.ip ? req.ip : '';
      const headers = req.headers || {};
      const ua = headers['user-agent'];
      userAgent = ua ? ua : '';
    }

    // Read the actor info from the user, if any.
    let actorId = undefined;
    let actorEmail = '';
    let role = '';
    if (user) {
      actorId = user._id;
      actorEmail = user.email ? user.email : '';
      role = user.role ? user.role : '';
    }

    await AuditLog.create({
      actor: actorId,
      actorEmail: actorEmail,
      role: role,
      action: action,
      entity: entity,
      entityId: entityId,
      ip: ip,
      userAgent: userAgent,
      meta: meta,
    });
  } catch (err) {
    // We never want a failed audit log to break the user-facing request.
    console.error('[audit] failed:', err.message);
  }
}

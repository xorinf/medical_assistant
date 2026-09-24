// AdminUserController.js
// -----------------------------------------------------------------------------
// Admin endpoints for managing User accounts:
//   GET    /api/admin/users                 → list all users
//   PATCH  /api/admin/users/:id/disable     → set isActive=false
//   PATCH  /api/admin/users/:id/enable      → set isActive=true
// -----------------------------------------------------------------------------

import User from '../models/UserModel.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';

export async function listUsers(_req, res) {
  const items = await User.find().sort({ createdAt: -1 }).lean();
  // Strip the passwordHash from every row before sending.
  const safe = items.map((u) => {
    const copy = Object.assign({}, u);
    delete copy.passwordHash;
    return copy;
  });
  res.json({ items: safe });
}

async function setActive(req, res, active) {
  const userId = req.params.id;
  const updated = await User.findByIdAndUpdate(userId, { isActive: active }, { new: true });
  if (!updated) {
    throw new AppError(404, 'User not found');
  }
  await logEvent({
    req: req,
    user: req.user,
    action: active ? 'user.enable' : 'user.disable',
    entity: 'User',
    entityId: updated._id,
  });
  res.json({ user: updated.toSafeJSON() });
}

export async function disable(req, res) { setActive(req, res, false); }
export async function enable(req, res)  { setActive(req, res, true); }

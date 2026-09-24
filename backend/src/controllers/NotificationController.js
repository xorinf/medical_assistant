// NotificationController.js
// -----------------------------------------------------------------------------
// In-app notifications:
//   GET    /api/notifications        → list the current user's notifications
//   POST   /api/notifications/:id/read  → mark one as read
//   POST   /api/notifications/read-all  → mark ALL as read
//   POST   /api/notifications        → admin only: send a custom notification
// -----------------------------------------------------------------------------

import { z } from 'zod';
import Notification from '../models/NotificationModel.js';
import { AppError } from '../utils/Errors.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';

// listMine(req, res)
//   Returns the current user's notifications, newest first.
//   Optional ?unreadOnly=true filter.
export async function listMine(req, res) {
  const userId = req.user._id;
  const filter = { userId: userId };
  if (req.query.unreadOnly === 'true') {
    filter.readAt = null;
  }
  const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const unreadCount = await Notification.countDocuments({ userId: userId, readAt: null });
  res.json({ items: items, unreadCount: unreadCount });
}

// markOneRead(req, res)
//   Mark ONE of the current user's notifications as read.
export async function markOneRead(req, res) {
  const notifId = req.params.id;
  const userId = req.user._id;
  const updated = await Notification.findOneAndUpdate(
    { _id: notifId, userId: userId },
    { readAt: new Date() },
    { new: true }
  );
  if (!updated) {
    throw new AppError(404, 'Notification not found');
  }
  res.json({ notification: updated });
}

// markAllRead(req, res)
//   Mark ALL of the current user's unread notifications as read.
export async function markAllRead(req, res) {
  const userId = req.user._id;
  const result = await Notification.updateMany(
    { userId: userId, readAt: null },
    { readAt: new Date() }
  );
  res.json({ modified: result.modifiedCount || 0 });
}

// Schema for admin "send a custom notification"
const SendSchema = z.object({
  userId: z.string(),
  kind: z.string(),
  title: z.string(),
  body: z.string().optional(),
  data: z.record(z.any()).optional(),
});

// sendCustom(req, res)
//   Admin-only: push a custom notification to any user.
export async function sendCustom(req, res) {
  const data = SendSchema.parse(req.body);
  const created = await Notification.create({
    userId: data.userId,
    kind: data.kind,
    title: data.title,
    body: data.body ? data.body : '',
    data: data.data ? data.data : {},
  });
  res.status(201).json({ notification: created });
}

// Export middleware separately so the API file can wire them in cleanly.
export const auth = authRequired;
export const adminOnly = requireRole(ROLES.ADMIN);

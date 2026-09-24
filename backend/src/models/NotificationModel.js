// NotificationModel.js
// -----------------------------------------------------------------------------
// An in-app notification belongs to ONE user.
//   - userId: who receives it
//   - kind:   what kind ('appointment.confirmed', 'lab.verified', ...)
//   - title:  short headline shown in the bell
//   - body:   one-line description
//   - data:   anything else the frontend needs (links, ids, etc.)
//   - readAt: set when the user clicks "mark as read"
// -----------------------------------------------------------------------------

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind:   { type: String, required: true },
    title:  { type: String, required: true },
    body:   { type: String, default: '' },
    data:   { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'm_assist_notifications' }
);

export default mongoose.model('Notification', NotificationSchema);

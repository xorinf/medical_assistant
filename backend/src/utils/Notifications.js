// Notifications.js
// -----------------------------------------------------------------------------
// Tiny helpers for sending an in-app notification to a user.
// The notification goes into the m_assist_notifications collection.
// -----------------------------------------------------------------------------

import Notification from '../models/NotificationModel.js';

// notify(userId, kind, title, body, data)
//   userId:  the User document id to receive the notification
//   kind:    short string like 'appointment.confirmed'
//   title:   short headline
//   body:    one-line description (can be empty)
//   data:    any extra object the frontend needs
export async function notify(userId, kind, title, body, data) {
  if (!userId) {
    return;
  }
  try {
    await Notification.create({
      userId: userId,
      kind: kind,
      title: title,
      body: body ? body : '',
      data: data ? data : {},
    });
  } catch (err) {
    // Don't break the request just because the notification failed.
    console.error('[notify] failed:', err.message);
  }
}

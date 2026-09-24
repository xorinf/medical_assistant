// NotificationAPI.js
// -----------------------------------------------------------------------------
//   GET   /api/notifications           → list mine
//   POST  /api/notifications/:id/read  → mark one read
//   POST  /api/notifications/read-all  → mark all read
//   POST  /api/notifications           → admin sends a custom one
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/NotificationController.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const notificationRouter = Router();

notificationRouter.get('/',         ctl.auth,         asyncHandler(ctl.listMine));
notificationRouter.post('/:id/read', ctl.auth,        asyncHandler(ctl.markOneRead));
notificationRouter.post('/read-all', ctl.auth,        asyncHandler(ctl.markAllRead));
notificationRouter.post('/',        ctl.auth, ctl.adminOnly, asyncHandler(ctl.sendCustom));

export default notificationRouter;

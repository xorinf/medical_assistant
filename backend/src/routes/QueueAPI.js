// QueueAPI.js
// -----------------------------------------------------------------------------
//   POST /api/queue/check-in/:appointmentId
//   POST /api/queue/start-consult/:appointmentId
//   POST /api/queue/complete/:appointmentId
//   GET  /api/queue/today?doctor=<id>
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/QueueController.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const queueRouter = Router();
queueRouter.post('/check-in/:appointmentId',     ctl.auth, ctl.staffOnly, asyncHandler(ctl.checkIn));
queueRouter.post('/start-consult/:appointmentId', ctl.auth, ctl.staffOnly, asyncHandler(ctl.startConsult));
queueRouter.post('/complete/:appointmentId',      ctl.auth, ctl.staffOnly, asyncHandler(ctl.complete));
queueRouter.get('/today',                         ctl.auth, ctl.staffOnly, asyncHandler(ctl.todayQueue));
export default queueRouter;

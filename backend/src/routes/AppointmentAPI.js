// AppointmentAPI.js
// -----------------------------------------------------------------------------
// Routes for appointments.
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/AppointmentController.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const appointmentRouter = Router();

appointmentRouter.use(authRequired);

// GET    /api/appointments          → list appointments (role-based filter inside the controller)
appointmentRouter.get('/', asyncHandler(ctl.list));

// POST   /api/appointments          → create an appointment (admin, reception, patient)
appointmentRouter.post('/', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), asyncHandler(ctl.create));

// PUT    /api/appointments/:id      → update an appointment (admin, reception, patient)
appointmentRouter.put('/:id', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), asyncHandler(ctl.update));

// POST   /api/appointments/:id/cancel → soft-cancel an appointment
appointmentRouter.post('/:id/cancel', asyncHandler(ctl.cancel));

export default appointmentRouter;

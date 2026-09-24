// DoctorAPI.js
// -----------------------------------------------------------------------------
// Routes for doctor records.
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/DoctorController.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const doctorRouter = Router();

doctorRouter.use(authRequired);

// GET /api/doctors      → list all doctors (admin, reception, patient)
doctorRouter.get('/', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), asyncHandler(ctl.list));

// POST /api/doctors     → add a new doctor (admin only)
doctorRouter.post('/', requireRole(ROLES.ADMIN), asyncHandler(ctl.create));

// GET /api/doctors/:id  → fetch one doctor
doctorRouter.get('/:id', asyncHandler(ctl.getOne));

export default doctorRouter;

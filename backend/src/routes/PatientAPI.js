// PatientAPI.js
// -----------------------------------------------------------------------------
// Routes for patient records.
//
// Every route here requires a valid JWT (authRequired).
// Some routes additionally restrict which roles can call them (requireRole).
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/PatientController.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const patientRouter = Router();

// Everything below requires the user to be logged in.
patientRouter.use(authRequired);

// GET /api/patients       → list all patients (admin, reception, doctor)
patientRouter.get('/', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), asyncHandler(ctl.list));

// POST /api/patients      → create a new patient (admin, reception)
patientRouter.post('/', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST), asyncHandler(ctl.create));

// GET /api/patients/:id   → fetch one patient
patientRouter.get('/:id', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT), asyncHandler(ctl.getOne));

// PUT /api/patients/:id   → update a patient (admin, reception)
patientRouter.put('/:id', requireRole(ROLES.ADMIN, ROLES.RECEPTIONIST), asyncHandler(ctl.update));

export default patientRouter;

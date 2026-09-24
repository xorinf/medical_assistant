// ClinicalAPI.js
// -----------------------------------------------------------------------------
// Routes for "clinical work":
//   - Patient timeline
//   - Medical notes + AI summary
//   - Prescriptions + AI plain-language explainer
//   - Lab orders + state transitions
//   - Invoices + payments
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/ClinicalController.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const clinicalRouter = Router();

clinicalRouter.use(authRequired);

// ---- Patient timeline -------------------------------------------------------
// GET /api/timeline/:id → bundle of everything for one patient
clinicalRouter.get('/timeline/:id', asyncHandler(ctl.timeline));

// ---- Medical notes ----------------------------------------------------------
// POST /api/notes                 → doctor saves a SOAP note
// POST /api/notes/:id/summarize   → generate AI summary for a note
clinicalRouter.post('/notes', requireRole(ROLES.DOCTOR, ROLES.ADMIN), asyncHandler(ctl.createNote));
clinicalRouter.post('/notes/:id/summarize', requireRole(ROLES.DOCTOR, ROLES.ADMIN), asyncHandler(ctl.summarizeNote));

// ---- Prescriptions ----------------------------------------------------------
// POST /api/prescriptions               → doctor creates a prescription
// GET  /api/prescriptions               → list prescriptions
// POST /api/prescriptions/:id/explain   → generate AI plain-language explainer
clinicalRouter.post('/prescriptions', requireRole(ROLES.DOCTOR, ROLES.ADMIN), asyncHandler(ctl.createRx));
clinicalRouter.get('/prescriptions', asyncHandler(ctl.listRx));
clinicalRouter.post('/prescriptions/:id/explain', requireRole(ROLES.DOCTOR, ROLES.ADMIN), asyncHandler(ctl.explainRx));

// ---- Lab orders -------------------------------------------------------------
// POST  /api/lab/orders                → doctor orders a lab test
// GET   /api/lab/orders                → list all lab orders
// PATCH /api/lab/orders/:id/status     → lab tech moves it to a new state
clinicalRouter.post('/lab/orders', requireRole(ROLES.DOCTOR, ROLES.ADMIN), asyncHandler(ctl.createLabOrder));
clinicalRouter.get('/lab/orders', asyncHandler(ctl.listLabOrders));
clinicalRouter.patch('/lab/orders/:id/status', requireRole(ROLES.LAB, ROLES.ADMIN), asyncHandler(ctl.transitionLab));

// ---- Invoices ---------------------------------------------------------------
// POST /api/invoices          → reception creates an invoice
// GET  /api/invoices          → list invoices
// POST /api/invoices/:id/pay  → record a payment
clinicalRouter.post('/invoices', requireRole(ROLES.RECEPTIONIST, ROLES.ADMIN), asyncHandler(ctl.createInvoice));
clinicalRouter.get('/invoices', asyncHandler(ctl.listInvoices));
clinicalRouter.post('/invoices/:id/pay', requireRole(ROLES.RECEPTIONIST, ROLES.ADMIN), asyncHandler(ctl.payInvoice));

export default clinicalRouter;

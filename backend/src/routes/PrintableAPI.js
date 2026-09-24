// PrintableAPI.js
// -----------------------------------------------------------------------------
// GET /api/printable/invoice/:id
// GET /api/printable/prescription/:id
// Returns HTML ready for window.print().
// -----------------------------------------------------------------------------

import { Router } from 'express';
import { authRequired } from '../middleware/AuthMiddleware.js';
import * as ctl from '../controllers/PrintableController.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const printableRouter = Router();
printableRouter.get('/invoice/:id',       authRequired, asyncHandler(ctl.printableInvoice));
printableRouter.get('/prescription/:id',  authRequired, asyncHandler(ctl.printablePrescription));
export default printableRouter;

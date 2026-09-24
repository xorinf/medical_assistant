// UploadAPI.js
// -----------------------------------------------------------------------------
// POST /api/uploads/image
//   - multipart/form-data, field name: "file"
//   - admin / doctor / lab / reception can upload (NOT patient-facing here)
// -----------------------------------------------------------------------------

import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import * as ctl from '../controllers/UploadController.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const uploadRouter = Router();
uploadRouter.post(
  '/image',
  authRequired,
  requireRole(ROLES.ADMIN, ROLES.DOCTOR, ROLES.LAB, ROLES.RECEPTIONIST),
  ctl.uploadSingle,
  asyncHandler(ctl.uploadImage)
);
export default uploadRouter;

// AdminAPI.js
// -----------------------------------------------------------------------------
// Routes only the clinic admin can hit:
//   - Services catalog
//   - Departments
//   - Audit log
//   - Stats
//   - Users (list/disable/enable)
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/AdminController.js';
import * as usersCtl from '../controllers/AdminUserController.js';
import { authRequired, requireRole } from '../middleware/AuthMiddleware.js';
import { ROLES } from '../utils/Roles.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const adminRouter = Router();

// Every route here is admin-only.
adminRouter.use(authRequired, requireRole(ROLES.ADMIN));

// ---- Services ---------------------------------------------------------------
adminRouter.get('/services', asyncHandler(ctl.listServices));
adminRouter.post('/services', asyncHandler(ctl.createService));

// ---- Departments ------------------------------------------------------------
adminRouter.get('/departments', asyncHandler(ctl.listDepartments));
adminRouter.post('/departments', asyncHandler(ctl.createDepartment));

// ---- Users ------------------------------------------------------------------
adminRouter.get('/users', asyncHandler(usersCtl.listUsers));
adminRouter.patch('/users/:id/disable', asyncHandler(usersCtl.disable));
adminRouter.patch('/users/:id/enable',  asyncHandler(usersCtl.enable));

// ---- Audit log --------------------------------------------------------------
adminRouter.get('/audit', asyncHandler(ctl.listAudit));

// ---- Stats ------------------------------------------------------------------
adminRouter.get('/stats', asyncHandler(ctl.stats));

export default adminRouter;

// AuthAPI.js
// -----------------------------------------------------------------------------
// Routes for login, register, and "who am I".
// File naming convention: <Area>API.js
//
// Every route handler is wrapped in asyncHandler so thrown errors reach
// the central ErrorMiddleware instead of crashing the process.
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/AuthController.js';
import { authRequired } from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const authRouter = Router();

// POST /api/auth/login   → returns { token, user }
authRouter.post('/login', asyncHandler(ctl.login));

// POST /api/auth/register → creates a new account (demo: open to all)
authRouter.post('/register', asyncHandler(ctl.register));

// GET /api/auth/me → who is the current logged-in user?
authRouter.get('/me', authRequired, asyncHandler(ctl.me));

export default authRouter;

// AuthMiddleware.js
// -----------------------------------------------------------------------------
// Two middleware functions:
//   1. authRequired — blocks the request unless a valid JWT is present.
//                     Sets req.user to the user document so controllers
//                     can read it.
//   2. requireRole(...roles) — returns a middleware that blocks the request
//                              unless req.user.role is in the allowed list.
//
// How a noob should read this file:
//   - A "middleware" is a function that runs BEFORE the route handler.
//     It can call next() to continue, or call next(error) to fail.
// -----------------------------------------------------------------------------

import { verify } from '../utils/Jwt.js';
import { AppError } from '../utils/Errors.js';
import { ensureDB } from '../config/Database.js';
import User from '../models/UserModel.js';

// authRequired
//   Steps:
//     1. Read the "Authorization: Bearer <token>" header.
//     2. Verify the token (signature + expiry).
//     3. Look up the user by id from the token payload.
//     4. Attach the user to req.user and call next().
//     On any failure → AppError(401).
export async function authRequired(req, _res, next) {
  try {
    // Fail fast with 503 if Mongo isn't reachable, instead of hanging.
    ensureDB();

    const headerValue = req.headers.authorization ? req.headers.authorization : '';
    const bearerPrefix = 'Bearer ';
    let token = '';
    if (headerValue.startsWith(bearerPrefix)) {
      token = headerValue.slice(bearerPrefix.length);
    }

    if (!token) {
      throw new AppError(401, 'Missing token');
    }

    const decoded = verify(token);
    const userId = decoded.sub;

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError(401, 'Invalid token'));
    }
  }
}

// requireRole(...roles)
//   Returns a middleware that fails with 403 if the logged-in user is
//   not in the allowed list.
//
// Usage:
//   router.get('/secret', authRequired, requireRole(ROLES.ADMIN), handler);
export function requireRole(...roles) {
  return function roleGuard(req, _res, next) {
    if (!req.user) {
      return next(new AppError(401, 'Unauthenticated'));
    }
    const userRole = req.user.role;
    const allowed = roles.indexOf(userRole) !== -1;
    if (!allowed) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}

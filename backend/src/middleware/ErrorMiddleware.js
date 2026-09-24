// ErrorMiddleware.js
// -----------------------------------------------------------------------------
// Two pieces:
//   1. notFound — runs when no route matches the URL; returns a 404.
//   2. errorHandler — runs when any earlier middleware throws; turns the
//                     error into a clean JSON response.
//
// The order matters: notFound is registered BEFORE errorHandler in app.js.
// -----------------------------------------------------------------------------

import { ZodError } from 'zod';
import { AppError } from '../utils/Errors.js';

// notFound — 404 handler for unmatched routes.
export function notFound(_req, _res, next) {
  next(new AppError(404, 'Route not found'));
}

// errorHandler — turns any thrown error into a JSON response.
//   - ZodError      → 400  "Validation failed"  + the validation details
//   - AppError      → <its status>  + its message
//   - Mongo 11000   → 409  duplicate key
//   - CastError     → 400  invalid id
//   - anything else → 500  + we log it so we don't lose the stack trace
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  // Mongo duplicate-key error
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', details: err.keyValue });
  }

  // Mongoose "bad ObjectId" error
  if (err && err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Mongoose errors when the model is buffered / not connected.
  // With bufferCommands:false, this fires synchronously when the DB is down.
  if (err && err.name === 'MongooseError') {
    return res.status(503).json({
      error: 'Database is unavailable. Please try again shortly.',
    });
  }

  // Mongo driver network / server-selection errors — these fire mid-query
  // when the connection is reconnecting. Same 503 treatment.
  if (err && (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkTimeoutError')) {
    return res.status(503).json({
      error: 'Database is unavailable. Please try again shortly.',
    });
  }

  // Last resort — log so we don't lose the stack trace.
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
}

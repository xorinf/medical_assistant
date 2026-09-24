// AsyncHandler.js
// -----------------------------------------------------------------------------
// Wraps an async Express route handler so that any rejected promise is
// passed to next() instead of crashing the process.
//
// Express 4 does NOT automatically forward async errors to the error
// middleware. Express 5 does. Until we move to Express 5, every handler
// must be wrapped with this helper.
// -----------------------------------------------------------------------------

export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

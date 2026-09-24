// Errors.js
// -----------------------------------------------------------------------------
// AppError is the one error class every controller throws.
//
// Why have one error class?
//   - The ErrorMiddleware can recognize AppError and turn it into a clean
//     JSON response with the right HTTP status code.
//   - Controllers don't need to know Express; they just `throw new AppError(...)`.
// -----------------------------------------------------------------------------

// Constructor arguments:
//   status   — the HTTP status code we want to return (e.g. 400, 401, 404, 409)
//   message  — a short human-readable message (this becomes `error` in the JSON)
//   details  — optional extra info (this becomes `details` in the JSON)
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

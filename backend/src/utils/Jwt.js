// Jwt.js
// -----------------------------------------------------------------------------
// Tiny helpers around the `jsonwebtoken` package.
//
// sign(payload)   → produces a JWT string we send to the client
// verify(token)   → checks the token's signature and expiry, returns the payload
//
// The secret used for signing lives in process.env.JWT_SECRET and must be
// set in backend/.env (never hardcoded).
// -----------------------------------------------------------------------------

import jwt from 'jsonwebtoken';

// sign: turn { sub: <userId>, role: <role> } into a token the client stores.
export function sign(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn });
}

// verify: given a token, return the payload if it's valid; throws otherwise.
export function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

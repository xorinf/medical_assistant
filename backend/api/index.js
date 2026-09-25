// Vercel serverless entry: every /api/* request becomes a function call.
// Keeps one Express app, no rewrite to per-route handlers.
import '../src/server.js';
import { buildApp } from '../src/app.js';
export default buildApp();

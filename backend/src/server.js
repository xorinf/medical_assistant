// server.js
// -----------------------------------------------------------------------------
// Local dev entry. On Vercel, api/index.js is the entry — this file is
// imported only for its side-effects (it connects to Mongo and starts
// listening). Mongoose caches the connection, so serverless reuse is fine.
//
// Behavior:
//   - Always binds the HTTP port (so the UI is reachable even if Mongo is down).
//   - Tries to connect to Mongo; logs success or failure but never exits.
//   - Routes that need the DB will surface 500s if the DB is unreachable.
// -----------------------------------------------------------------------------

import 'dotenv/config';
import { buildApp } from './app.js';
import { connectDB } from './config/Database.js';

const app = buildApp();
const port = Number(process.env.PORT) || 5050;

// 1) Bind the port FIRST so the UI is reachable even before Mongo connects.
app.listen(port, '0.0.0.0', () => {
  console.log('[medassist] api on http://localhost:' + port);
});

// 2) Then try to connect to Mongo. Automatically retry if initial connect fails.
async function initDB(attempt = 1) {
  try {
    await connectDB();
    console.log('[medassist] mongo connected');
  } catch (err) {
    console.error(`[medassist] mongo connection failed (attempt ${attempt}):`, err.message);
    const delay = Math.min(5000 * attempt, 30000);
    console.log(`[medassist] retrying mongo connection in ${delay / 1000}s...`);
    setTimeout(() => initDB(attempt + 1), delay);
  }
}
initDB();

// Vercel serverless entry — when running as a function we export the app
// instead of calling listen(). Vercel ignores the listen() call above.
export default app;

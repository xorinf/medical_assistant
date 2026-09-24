// Database.js
// -----------------------------------------------------------------------------
// Two helpers:
//   - connectDB()        — connects mongoose; capped timeout so DNS issues
//                          don't hang the whole startup.
//   - isDBReady()        — true if mongoose has an active connection.
//   - ensureDB()         — throws a 503 AppError if isDBReady() is false.
//                          Use at the top of every DB-backed route so that
//                          a down DB returns a clean 503 instead of a 500.
// -----------------------------------------------------------------------------

import dns from 'node:dns';
import mongoose from 'mongoose';
import { AppError } from '../utils/Errors.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    // Fail loudly — better to crash at boot than to run with no DB.
    throw new Error('MONGO_URI is required (set it in backend/.env)');
  }

  // Ensure fast, reliable SRV lookup without local router querySrv ETIMEOUT
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {
      /* ignore if restricted */
    }
  }

  mongoose.set('strictQuery', true);
  // Don't buffer queries when disconnected — fail fast instead of timing out.
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 20_000,
    connectTimeoutMS: 20_000,
  });

  // Catch mongoose's own reconnect-time error events so they don't become
  // uncaughtException (which would print "Internal server error" responses
  // for requests in flight during a reconnect attempt). We log and swallow.
  mongoose.connection.on('error', (err) => {
    console.error('[medassist] mongoose connection error:', err.message);
  });

  return mongoose.connection;
}

// isDBReady(): true when mongoose has an active connection.
// Used by /api/health to report DB status, and by ensureDB() as a fast guard.
export function isDBReady() {
  // 1 = connected, 2 = connecting
  return mongoose.connection.readyState === 1;
}

// ensureDB(): middleware-friendly guard for individual route handlers.
// Throws a 503 AppError if the DB isn't ready, so routes fail fast with a
// useful status instead of hanging on a connect attempt.
export function ensureDB() {
  if (!isDBReady()) {
    throw new AppError(503, 'Database is unavailable. Please try again shortly.');
  }
}

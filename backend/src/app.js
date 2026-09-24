import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/API.js';
import { errorHandler, notFound } from './middleware/ErrorMiddleware.js';
import { isDBReady } from './config/Database.js';

export function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  if (process.env.NODE_ENV !== 'test' && process.stdout.isTTY === true) {
    app.use(morgan('dev'));
  }

  // ponytail: one global limit; per-route limits for sensitive endpoints when real traffic arrives.
  app.use('/api', rateLimit({ windowMs: 60_000, max: 200 }));
  app.use('/api/auth/login', rateLimit({ windowMs: 60_000, max: 10 }));

  app.get('/api/health', (_req, res) => {
    const ok = isDBReady();
    res.status(ok ? 200 : 503).json({ ok: ok, db: ok ? 'up' : 'down', ts: Date.now() });
  });

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

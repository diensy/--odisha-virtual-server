import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { loadUser } from './middleware/auth.js';
import { env } from './config/env.js';
import { api } from './routes/index.js';
import { apiLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());
  app.use(loadUser);
  // Content language from the X-Lang header (sent by the web app) or ?lang=; English otherwise.
  app.use((req, _res, next) => {
    const lang = req.get('x-lang') ?? req.query.lang;
    req.lang = ['hi', 'or'].includes(lang) ? lang : 'en';
    next();
  });
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use('/api', apiLimiter, api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

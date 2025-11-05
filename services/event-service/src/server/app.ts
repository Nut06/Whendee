import cors from 'cors';
import express from 'express';
import type { Application } from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { eventRouter } from './routes/event.routes.js';

export async function createApp(): Promise<Application> {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ message: 'Event Service is running' });
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/events', eventRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import cors from 'cors';
import express from 'express';
import type { Application } from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { groupRouter } from './routes/group.routes.js';
import { invitationRouter } from './routes/invitation.routes.js';

export async function createApp(): Promise<Application> {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ message: 'Communication Service is running' });
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/groups', groupRouter);
  app.use('/invitations', invitationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import type { NextFunction, Request, Response } from 'express';

import { listEvents } from '../../services/event.service.js';

export async function listEventsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const events = await listEvents();

    return res.status(200).json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

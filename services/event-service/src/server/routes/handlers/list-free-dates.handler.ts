import type { NextFunction, Request, Response } from 'express';

import { listFreeDates } from '../../services/free-date.service.js';
import { eventIdParamSchema } from '../../validators/poll.schema.js';

export async function listFreeDatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const data = await listFreeDates(eventId);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

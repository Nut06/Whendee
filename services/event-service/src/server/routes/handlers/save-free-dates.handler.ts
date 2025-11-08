import type { NextFunction, Request, Response } from 'express';

import { setUserFreeDates } from '../../services/free-date.service.js';
import { eventIdParamSchema } from '../../validators/poll.schema.js';
import { saveFreeDatesBodySchema } from '../../validators/free-date.schema.js';

export async function saveFreeDatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const { userId, dates } = saveFreeDatesBodySchema.parse(req.body);
    await setUserFreeDates({ eventId, userId, dates });
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

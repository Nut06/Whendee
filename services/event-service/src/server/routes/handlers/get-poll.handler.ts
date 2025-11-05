import type { NextFunction, Request, Response } from 'express';

import { getPollForEvent } from '../../services/poll.service.js';
import { eventIdParamSchema } from '../../validators/poll.schema.js';

export async function getPollHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);

    const poll = await getPollForEvent(eventId);

    return res.status(200).json({
      data: poll,
    });
  } catch (error) {
    next(error);
  }
}

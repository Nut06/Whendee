import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../../middleware/http-error.js';
import { getEventById } from '../../services/event.service.js';
import { eventIdParamSchema } from '../../validators/poll.schema.js';

export async function getEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);

    const event = await getEventById(eventId);

    if (!event) {
      throw new HttpError(404, 'Event not found');
    }

    return res.status(200).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

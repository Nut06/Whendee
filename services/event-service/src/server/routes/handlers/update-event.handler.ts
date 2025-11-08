import type { NextFunction, Request, Response } from 'express';

import { updateEvent } from '../../services/event.service.js';
import { updateEventSchema } from '../../validators/create-event.schema.js';
import { eventIdParamSchema } from '../../validators/poll.schema.js';

export async function updateEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const payload = updateEventSchema.parse(req.body);

    await updateEvent(eventId, payload);

    return res.json({
      message: 'Event updated successfully',
      data: { eventId },
    });
  } catch (error) {
    next(error);
  }
}

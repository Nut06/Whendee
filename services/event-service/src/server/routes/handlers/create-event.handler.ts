import type { NextFunction, Request, Response } from 'express';

import { createEvent } from '../../services/event.service.js';
import { createEventSchema } from '../../validators/create-event.schema.js';

export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventInput = createEventSchema.parse(req.body);

    const event = await createEvent(eventInput);

    return res.status(201).json({
      message: 'Event created successfully',
      data: {
        eventId: event.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

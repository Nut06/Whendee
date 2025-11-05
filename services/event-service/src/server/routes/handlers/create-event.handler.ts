import type { NextFunction, Request, Response } from 'express';

import { createEvent } from '../../services/event.service.js';
import {
  createEventSchema,
  organizerSchema,
} from '../../validators/create-event.schema.js';
import { ensureUserIsActive } from '../../services/user-validation.service.js';

export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { organizerId } = organizerSchema.parse(req.body);

    await ensureUserIsActive(organizerId, { reason: 'create events' });

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

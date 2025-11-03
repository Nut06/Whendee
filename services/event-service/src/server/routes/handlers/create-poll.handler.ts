import type { NextFunction, Request, Response } from 'express';

import { createPoll } from '../../services/poll.service.js';
import { ensureUserIsActive } from '../../services/user-validation.service.js';
import {
  createPollBodySchema,
  eventIdParamSchema,
} from '../../validators/poll.schema.js';

export async function createPollHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const { organizerId, closesAt, options } = createPollBodySchema.parse(
      req.body,
    );

    await ensureUserIsActive(organizerId, { reason: 'create polls' });

    const poll = await createPoll({
      eventId,
      organizerId,
      options,
      closesAt,
    });

    return res.status(201).json({
      message: 'Poll created',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
}

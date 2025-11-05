import type { NextFunction, Request, Response } from 'express';

import { closePoll } from '../../services/poll.service.js';
import {
  closePollBodySchema,
  eventIdParamSchema,
} from '../../validators/poll.schema.js';

export async function closePollHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const body = closePollBodySchema.parse(req.body ?? {});

    const poll = await closePoll({
      eventId,
      finalOptionId: body?.finalOptionId,
    });

    return res.status(200).json({
      message: 'Poll closed',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
}

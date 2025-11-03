import type { NextFunction, Request, Response } from 'express';

import { addPollOption } from '../../services/poll.service.js';
import {
  addOptionBodySchema,
  eventIdParamSchema,
} from '../../validators/poll.schema.js';

export async function addPollOptionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const { label, order } = addOptionBodySchema.parse(req.body);

    const option = await addPollOption({
      eventId,
      label,
      order,
    });

    return res.status(201).json({
      message: 'Poll option created',
      data: option,
    });
  } catch (error) {
    next(error);
  }
}

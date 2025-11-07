import type { NextFunction, Request, Response } from 'express';

import { submitVote } from '../../services/poll.service.js';
import {
  eventIdParamSchema,
  submitVoteBodySchema,
} from '../../validators/poll.schema.js';

export async function submitVoteHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const { optionId, voterId } = submitVoteBodySchema.parse(req.body);

    const result = await submitVote({
      eventId,
      optionId,
      voterId,
    });

    return res.status(202).json({
      message: 'Vote accepted',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

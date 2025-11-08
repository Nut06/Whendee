import type { NextFunction, Request, Response } from 'express';

import { listEventMembers } from '../../services/member.service.js';
import { eventParamsSchema } from '../../validators/event-member.schema.js';

export async function listEventMembersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventParamsSchema.parse(req.params);
    const members = await listEventMembers(eventId);

    return res.json({
      data: members,
    });
  } catch (error) {
    next(error);
  }
}

import type { NextFunction, Request, Response } from 'express';

import { addMemberToEvent } from '../../services/member.service.js';
import {
  addMemberBodySchema,
  eventParamsSchema,
} from '../../validators/event-member.schema.js';

export async function addEventMemberHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { eventId } = eventParamsSchema.parse(req.params);
    const body = addMemberBodySchema.parse(req.body);

    const member = await addMemberToEvent({
      eventId,
      memberId: body.memberId,
      status: body.status,
    });

    return res.status(201).json({
      message: 'Member saved',
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

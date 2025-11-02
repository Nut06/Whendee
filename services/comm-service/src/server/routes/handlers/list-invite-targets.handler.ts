import type { NextFunction, Request, Response } from 'express';

import { listInviteTargets } from '../../services/invitation.service.js';
import { groupIdParamsSchema } from '../../validators/invitation.schema.js';

export async function listInviteTargetsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { groupId } = groupIdParamsSchema.parse(req.params);

    const targets = await listInviteTargets(groupId);

    return res.status(200).json({
      data: targets,
    });
  } catch (error) {
    next(error);
  }
}

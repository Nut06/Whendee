import type { NextFunction, Request, Response } from 'express';

import { getInvitationByCode } from '../../services/invitation.service.js';
import { inviteLinkParamsSchema } from '../../validators/invitation.schema.js';

export async function getInvitationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { inviteCode } = inviteLinkParamsSchema.parse(req.params);

    const invitation = await getInvitationByCode(inviteCode);

    return res.status(200).json({
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
}

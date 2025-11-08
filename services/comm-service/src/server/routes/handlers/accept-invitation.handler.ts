import type { NextFunction, Request, Response } from 'express';

import { acceptInvitation } from '../../services/invitation.service.js';
import { inviteLinkParamsSchema, invitationActionBodySchema } from '../../validators/invitation.schema.js';

export async function acceptInvitationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { inviteCode } = inviteLinkParamsSchema.parse(req.params);
    const body = invitationActionBodySchema.parse(req.body ?? {});

    const invitation = await acceptInvitation({
      inviteCode,
      inviteeId: body?.inviteeId,
    });

    return res.status(200).json({
      message: 'Invitation accepted',
      data: {
        groupId: invitation.groupId,
        inviteeId: invitation.inviteeId,
      },
    });
  } catch (error) {
    next(error);
  }
}

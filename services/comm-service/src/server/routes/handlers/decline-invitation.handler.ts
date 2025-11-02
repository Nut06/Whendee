import type { NextFunction, Request, Response } from 'express';

import { declineInvitation } from '../../services/invitation.service.js';
import {
  inviteLinkParamsSchema,
  invitationActionBodySchema,
} from '../../validators/invitation.schema.js';

export async function declineInvitationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { inviteCode } = inviteLinkParamsSchema.parse(req.params);
    const body = invitationActionBodySchema.parse(req.body ?? {});

    await declineInvitation({
      inviteCode,
      inviteeId: body?.inviteeId,
    });

    return res.status(200).json({
      message: 'Invitation declined',
    });
  } catch (error) {
    next(error);
  }
}

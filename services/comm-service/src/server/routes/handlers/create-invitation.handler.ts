import type { NextFunction, Request, Response } from 'express';

import { createInvitation } from '../../services/invitation.service.js';
import { ensureUserIsActive } from '../../services/user.service.js';
import {
  createInvitationBodySchema,
  groupIdParamsSchema,
} from '../../validators/invitation.schema.js';

export async function createInvitationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { groupId } = groupIdParamsSchema.parse(req.params);
    const { inviterId, inviteeId, expiresInMinutes } =
      createInvitationBodySchema.parse(req.body);

    await ensureUserIsActive(inviterId, 'send invitations');

    const invitation = await createInvitation({
      groupId,
      inviterId,
      inviteeId,
      expiresInMinutes,
    });

    return res.status(201).json({
      message: 'Invitation created',
      data: {
        inviteCode: invitation.inviteCode,
        inviteLink: invitation.inviteLink,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

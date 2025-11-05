import { Router } from 'express';

import { acceptInvitationHandler } from './handlers/accept-invitation.handler.js';
import { declineInvitationHandler } from './handlers/decline-invitation.handler.js';
import { getInvitationHandler } from './handlers/get-invitation.handler.js';

export const invitationRouter: Router = Router();

invitationRouter.get('/:inviteCode', getInvitationHandler);
invitationRouter.post('/:inviteCode/accept', acceptInvitationHandler);
invitationRouter.post('/:inviteCode/decline', declineInvitationHandler);

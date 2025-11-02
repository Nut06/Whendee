import { Router } from 'express';

import { listInviteTargetsHandler } from './handlers/list-invite-targets.handler.js';
import { createInvitationHandler } from './handlers/create-invitation.handler.js';

export const groupRouter: Router = Router();

groupRouter.get('/:groupId/invite-targets', listInviteTargetsHandler);
groupRouter.post('/:groupId/invitations', createInvitationHandler);

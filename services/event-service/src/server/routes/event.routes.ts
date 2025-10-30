import { Router } from 'express';

import { createEventHandler } from './handlers/create-event.handler.js';
import { getPollHandler } from './handlers/get-poll.handler.js';
import { submitVoteHandler } from './handlers/submit-vote.handler.js';
import { closePollHandler } from './handlers/close-poll.handler.js';

export const eventRouter: Router = Router();

eventRouter.post('/', createEventHandler);
eventRouter.get('/:eventId/poll', getPollHandler);
eventRouter.post('/:eventId/poll/votes', submitVoteHandler);
eventRouter.post('/:eventId/poll/close', closePollHandler);

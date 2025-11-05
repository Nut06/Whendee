import { Router } from 'express';

import { listEventsHandler } from './handlers/list-events.handler.js';
import { getEventHandler } from './handlers/get-event.handler.js';
import { createEventHandler } from './handlers/create-event.handler.js';
import { createPollHandler } from './handlers/create-poll.handler.js';
import { getPollHandler } from './handlers/get-poll.handler.js';
import { addPollOptionHandler } from './handlers/add-poll-option.handler.js';
import { submitVoteHandler } from './handlers/submit-vote.handler.js';
import { closePollHandler } from './handlers/close-poll.handler.js';

export const eventRouter: Router = Router();

eventRouter.get('/', listEventsHandler);
eventRouter.post('/', createEventHandler);
eventRouter.get('/:eventId', getEventHandler);
eventRouter.post('/:eventId/poll', createPollHandler);
eventRouter.post('/:eventId/poll/options', addPollOptionHandler);
eventRouter.get('/:eventId/poll', getPollHandler);
eventRouter.post('/:eventId/poll/votes', submitVoteHandler);
eventRouter.post('/:eventId/poll/close', closePollHandler);

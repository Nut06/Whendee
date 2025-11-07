import { Router } from 'express';

import { createEventHandler } from './handlers/create-event.handler.js';
import { createPollHandler } from './handlers/create-poll.handler.js';
import { getPollHandler } from './handlers/get-poll.handler.js';
import { addPollOptionHandler } from './handlers/add-poll-option.handler.js';
import { submitVoteHandler } from './handlers/submit-vote.handler.js';
import { closePollHandler } from './handlers/close-poll.handler.js';
import { addEventMemberHandler } from './handlers/add-event-member.handler.js';
import { listEventMembersHandler } from './handlers/list-event-members.handler.js';
import { listEventsHandler } from './handlers/list-events.handler.js';
import { updateEventHandler } from './handlers/update-event.handler.js';
import { listFreeDatesHandler } from './handlers/list-free-dates.handler.js';
import { saveFreeDatesHandler } from './handlers/save-free-dates.handler.js';

export const eventRouter: Router = Router();

eventRouter.get('/', listEventsHandler);
eventRouter.post('/', createEventHandler);
eventRouter.patch('/:eventId', updateEventHandler);
eventRouter.get('/:eventId/free-dates', listFreeDatesHandler);
eventRouter.post('/:eventId/free-dates', saveFreeDatesHandler);
eventRouter.post('/:eventId/poll', createPollHandler);
eventRouter.post('/:eventId/poll/options', addPollOptionHandler);
eventRouter.get('/:eventId/poll', getPollHandler);
eventRouter.post('/:eventId/poll/votes', submitVoteHandler);
eventRouter.post('/:eventId/poll/close', closePollHandler);
eventRouter.post('/:eventId/members', addEventMemberHandler);
eventRouter.get('/:eventId/members', listEventMembersHandler);

import { Router } from 'express';
import {
  listNotifications,
  createEventInviteNotification,
  markNotificationRead,
  respondToNotification,
} from '@/controller/notificationController';

export const notificationRouter = Router();

notificationRouter.get('/', listNotifications);
notificationRouter.post('/event-invite', createEventInviteNotification);
notificationRouter.post('/:notificationId/read', markNotificationRead);
notificationRouter.post('/:notificationId/respond', respondToNotification);

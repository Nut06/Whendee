import { NotificationRepo } from '@/repo/notificationRepo';
import type { Notification } from '@/types/notification';
import { AppError } from '@/types/appError';
import { BAD_REQUEST, NOT_FOUND } from '@/types/http';

type EventInvitePayload = {
  targetUserId: string;
  eventId: string;
  inviterId?: string;
  eventTitle: string;
  inviterName?: string;
};

export const notificationService = {
  async listForUser(userId: string): Promise<Notification[]> {
    if (!userId) {
      throw new AppError('User id is required', BAD_REQUEST, 'USER_ID_REQUIRED');
    }
    return NotificationRepo.listByUser(userId);
  },

  async createEventInvite(payload: EventInvitePayload): Promise<Notification> {
    if (!payload.targetUserId) {
      throw new AppError('targetUserId is required', BAD_REQUEST, 'USER_ID_REQUIRED');
    }
    if (!payload.eventId) {
      throw new AppError('eventId is required', BAD_REQUEST, 'EVENT_ID_REQUIRED');
    }
    const title = `You're invited to ${payload.eventTitle}`;
    const message = payload.inviterName
      ? `${payload.inviterName} invited you to join this event.`
      : 'You have been invited to join this event.';

    return NotificationRepo.create({
      userId: payload.targetUserId,
      type: 'EVENT_INVITE',
      title,
      message,
      eventId: payload.eventId,
      inviterId: payload.inviterId,
      payload: {
        eventId: payload.eventId,
        eventTitle: payload.eventTitle,
        inviterId: payload.inviterId,
        inviterName: payload.inviterName,
      },
    });
  },

  async markRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await NotificationRepo.markRead(notificationId, userId);
    if (!notification) {
      throw new AppError('Notification not found', NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  },

  async respond(
    notificationId: string,
    userId: string,
    action: 'ACCEPT' | 'DECLINE',
  ): Promise<Notification> {
    const mappedStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
    const notification = await NotificationRepo.respond(
      notificationId,
      userId,
      mappedStatus,
    );
    if (!notification) {
      throw new AppError('Notification not found', NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  },
};

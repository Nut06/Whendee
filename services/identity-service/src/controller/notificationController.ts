import type { Request, Response } from 'express';
import { BAD_REQUEST, OK } from '@/types/http';
import { AppError } from '@/types/appError';
import { notificationService } from '@/service/notificationService';
import { resolveUserId } from '@/utils/authRequest';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    console.log('[Notification Controller] listNotifications called', {
      userId,
      headers: req.headers,
    });
    
    const notifications = await notificationService.listForUser(userId);
    console.log('[Notification Controller] Notifications retrieved', {
      userId,
      count: notifications.length,
      notificationIds: notifications.map(n => n.id),
    });
    
    return res.status(OK).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    console.error('[Notification Controller] Failed to list notifications', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const createEventInviteNotification = async (
  req: Request,
  res: Response,
) => {
  const { targetUserId, eventId, inviterId, eventTitle, inviterName } = req.body ?? {};
  
  console.log('[Notification Controller] createEventInviteNotification called', {
    targetUserId,
    eventId,
    inviterId,
    eventTitle,
    inviterName,
    body: req.body,
  });

  if (!targetUserId || !eventId || !eventTitle) {
    console.warn('[Notification Controller] Missing required fields', {
      hasTargetUserId: !!targetUserId,
      hasEventId: !!eventId,
      hasEventTitle: !!eventTitle,
    });
    return res.status(BAD_REQUEST).json({
      success: false,
      message: 'targetUserId, eventId, and eventTitle are required',
    });
  }

  try {
    const notification = await notificationService.createEventInvite({
      targetUserId,
      eventId,
      inviterId,
      eventTitle,
      inviterName,
    });

    console.log('[Notification Controller] Notification created successfully', {
      notificationId: notification.id,
      userId: notification.userId,
      eventId: notification.eventId,
    });

    return res.status(OK).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification Controller] Failed to create notification', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  const { notificationId } = req.params;
  const notification = await notificationService.markRead(notificationId, userId);
  return res.status(OK).json({
    success: true,
    data: { notification },
  });
};

export const respondToNotification = async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  const { notificationId } = req.params;
  const action = (req.body?.action ?? '').toString().toUpperCase();
  if (action !== 'ACCEPT' && action !== 'DECLINE') {
    throw new AppError('action must be ACCEPT or DECLINE', BAD_REQUEST, 'INVALID_ACTION');
  }
  const notification = await notificationService.respond(
    notificationId,
    userId,
    action,
  );
  return res.status(OK).json({
    success: true,
    data: { notification },
  });
};

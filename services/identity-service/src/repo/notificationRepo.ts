import prisma from '@/utils/prisma';
import { Prisma } from '@/prisma/client';
import type {
  Notification,
  NotificationPayload,
  NotificationStatus,
  NotificationType,
} from '@/types/notification';

const notificationSelect = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  eventId: true,
  inviterId: true,
  payload: true,
  status: true,
  readAt: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const mapNotification = (record: any): Notification => ({
  id: record.id,
  userId: record.userId,
  type: record.type,
  title: record.title,
  message: record.message,
  eventId: record.eventId,
  inviterId: record.inviterId,
  payload: (record.payload ?? null) as NotificationPayload | null,
  status: record.status,
  readAt: record.readAt ?? null,
  resolvedAt: record.resolvedAt ?? null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const NotificationRepo = {
  async listByUser(userId: string, limit = 50): Promise<Notification[]> {
    const records = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: notificationSelect,
    });
    return records.map(mapNotification);
  },

  async create(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    eventId?: string;
    inviterId?: string;
    payload?: NotificationPayload | null;
  }): Promise<Notification> {
    const record = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message ?? null,
        eventId: params.eventId,
        inviterId: params.inviterId,
        payload: params.payload
          ? (JSON.parse(JSON.stringify(params.payload)) as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
      select: notificationSelect,
    });
    return mapNotification(record);
  },

  async markRead(notificationId: string, userId: string): Promise<Notification | null> {
    const record = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: notificationSelect,
    });
    if (!record) {
      return null;
    }
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: record.status === 'PENDING' ? 'READ' : record.status,
        readAt: record.readAt ?? new Date(),
      },
      select: notificationSelect,
    });
    return mapNotification(updated);
  },

  async respond(
    notificationId: string,
    userId: string,
    decision: NotificationStatus,
  ): Promise<Notification | null> {
    const record = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: notificationSelect,
    });
    if (!record) {
      return null;
    }
    if (record.status === 'ACCEPTED' || record.status === 'DECLINED') {
      return mapNotification(record);
    }
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: decision,
        resolvedAt: new Date(),
        readAt: record.readAt ?? new Date(),
      },
      select: notificationSelect,
    });
    return mapNotification(updated);
  },
};

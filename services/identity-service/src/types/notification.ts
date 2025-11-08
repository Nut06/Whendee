export type NotificationType = 'EVENT_INVITE';

export type NotificationStatus = 'PENDING' | 'READ' | 'ACCEPTED' | 'DECLINED';

export interface NotificationPayload {
  eventId?: string;
  eventTitle?: string;
  inviterId?: string;
  inviterName?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  eventId?: string | null;
  inviterId?: string | null;
  payload?: NotificationPayload | null;
  status: NotificationStatus;
  readAt?: Date | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

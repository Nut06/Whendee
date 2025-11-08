import { identityApi } from "../app/utils/api";

export type NotificationStatus = "PENDING" | "READ" | "ACCEPTED" | "DECLINED";

export type NotificationType = "EVENT_INVITE";

export interface NotificationPayload {
  eventId?: string;
  eventTitle?: string;
  inviterId?: string;
  inviterName?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  status: NotificationStatus;
  eventId?: string | null;
  inviterId?: string | null;
  payload?: NotificationPayload | null;
  createdAt: string;
}

type ListResponse = {
  success: boolean;
  data: {
    notifications: Notification[];
  };
};

export async function fetchNotifications() {
  const res = await identityApi.get<ListResponse>("/notification");
  return res.data.data.notifications;
}

export async function respondToNotification(notificationId: string, action: "ACCEPT" | "DECLINE") {
  await identityApi.post(`/notification/${notificationId}/respond`, { action });
}

export async function markNotificationRead(notificationId: string) {
  await identityApi.post(`/notification/${notificationId}/read`, {});
}

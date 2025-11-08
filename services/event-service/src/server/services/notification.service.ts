import { env } from '../../config/env.js';

interface EventInviteNotificationPayload {
  targetUserId: string;
  eventId: string;
  eventTitle: string;
  inviterId?: string;
  inviterName?: string;
}

export async function notifyEventInvite(
  payload: EventInviteNotificationPayload,
) {
  if (!env.USER_SERVICE_URL) {
    console.warn(
      '[Notification] USER_SERVICE_URL is not configured, skipping notification',
    );
    return;
  }

  const url = `${env.USER_SERVICE_URL}/notification/event-invite`;
  console.log('[Notification] Sending event invite notification', {
    url,
    targetUserId: payload.targetUserId,
    eventId: payload.eventId,
    eventTitle: payload.eventTitle,
    inviterId: payload.inviterId,
    inviterName: payload.inviterName,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(
        '[Notification] Failed to notify event invite',
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
      );
      return;
    }

    const result = await response.json().catch(() => null);
    console.log('[Notification] Event invite notification sent successfully', result);
  } catch (error) {
    console.error(
      '[Notification] Failed to notify event invite',
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    );
  }
}

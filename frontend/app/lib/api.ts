const EVENT_API_URL = process.env.EXPO_PUBLIC_EVENT_API_URL ?? 'http://localhost:3001';
const COMM_API_URL = process.env.EXPO_PUBLIC_COMM_API_URL ?? 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  base?: 'event' | 'comm';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = options.base ?? 'event';
  const baseUrl = base === 'event' ? EVENT_API_URL : COMM_API_URL;
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let detail: unknown = null;
    try {
      detail = await response.json();
    } catch {
      // ignore parse errors
    }
    const error = new Error(
      `Request failed with status ${response.status}: ${response.statusText}`,
    );
    (error as any).detail = detail;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Event service wrappers
export const eventApi = {
  createEvent(payload: {
    organizerId: string;
    title: string;
    description: string;
    location: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
  }) {
    return request<{ data: { eventId: string } }>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createPoll(
    eventId: string,
    payload: {
      organizerId: string;
      closesAt?: string;
      options: { label: string; order?: number }[];
    },
  ) {
    return request<{ message: string; data: unknown }>(`/events/${eventId}/poll`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addPollOption(eventId: string, payload: { label: string; order?: number }) {
    return request<{ message: string; data: { id: string; label: string; order: number; tally: number } }>(
      `/events/${eventId}/poll/options`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getEvents() {
    return request<{ data: any[] }>('/events');
  },

  getEvent(eventId: string) {
    return request<{ data: any }>(`/events/${eventId}`);
  },

  getPoll(eventId: string) {
    return request<{ data: any }>(`/events/${eventId}/poll`);
  },

  submitVote(eventId: string, payload: { optionId: string; voterId: string }) {
    return request<{ message: string; data: unknown }>(`/events/${eventId}/poll/votes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  closePoll(eventId: string, payload: { finalOptionId?: string } = {}) {
    return request<{ message: string; data: unknown }>(`/events/${eventId}/poll/close`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Communication service wrappers
export const commApi = {
  listInviteTargets(groupId: string) {
    return request<{ data: any[] }>(`/groups/${groupId}/invite-targets`, {
      base: 'comm',
    });
  },

  createInvitation(groupId: string, payload: {
    inviterId: string;
    inviteeId: string;
    expiresInMinutes?: number;
  }) {
    return request<{ message: string; data: { inviteCode: string; inviteLink: string; expiresAt: string } }>(
      `/groups/${groupId}/invitations`,
      {
        base: 'comm',
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getInvitation(inviteCode: string) {
    return request<{ data: any }>(`/invitations/${inviteCode}`, {
      base: 'comm',
    });
  },

  acceptInvitation(inviteCode: string, payload: { inviteeId?: string } = {}) {
    return request<{ message: string; data: { groupId: string; inviteeId: string } }>(
      `/invitations/${inviteCode}/accept`,
      {
        base: 'comm',
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  declineInvitation(inviteCode: string, payload: { inviteeId?: string } = {}) {
    return request<{ message: string }>(`/invitations/${inviteCode}/decline`, {
      base: 'comm',
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

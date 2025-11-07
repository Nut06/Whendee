import type { Event, Poll, EventMember } from "@/types/event.type";

type ApiError = Error & { status?: number };

type CreateEventPayload = {
  title: string;
  eventDescription: string;
  repeat?: string;
  budget?: number;
  alertMinutes?: number;
  scheduledAt?: string;
  meetingLink?: string;
};

type CreateEventResponse = {
  message: string;
  data: {
    eventId: string;
  };
};

const API_BASE = process.env.EXPO_PUBLIC_EVENT_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("Event API URL is not configured");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = "Event service request failed";
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) errorMessage = body.message;
    } catch {
      // ignore
    }
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function createEvent(payload: CreateEventPayload) {
  return request<CreateEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEvents() {
  return request<{ data: Event[] }>("/events");
}

export async function updateEvent(eventId: string, payload: Partial<CreateEventPayload>) {
  return request<CreateEventResponse>(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

type AddMemberResponse = { message: string; data: EventMember };

export async function ensureEventMember(
  eventId: string,
  userId: string,
  status: "INVITED" | "ACCEPTED" | "DECLINED" = "ACCEPTED",
) {
  return request<AddMemberResponse>(`/events/${eventId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, status }),
  });
}

export async function saveFreeDates(eventId: string, userId: string, dates: string[]) {
  return request<void>(`/events/${eventId}/free-dates`, {
    method: "POST",
    body: JSON.stringify({ userId, dates }),
  });
}

export async function fetchFreeDates(eventId: string) {
  return request<{ data: Array<{ userId: string; dates: string[] }> }>(
    `/events/${eventId}/free-dates`,
  );
}

export async function getPoll(eventId: string) {
  return request<{ data: Poll }>(`/events/${eventId}/poll`);
}

export async function createPollWithOption(eventId: string, label: string) {
  return request<{ data: Poll }>(`/events/${eventId}/poll`, {
    method: "POST",
    body: JSON.stringify({ options: [{ label }] }),
  });
}

export async function addPollOptionApi(eventId: string, label: string, userId: string) {
  return request<{ data: { id: string } }>(`/events/${eventId}/poll/options`, {
    method: "POST",
    body: JSON.stringify({ label, userId }),
  });
}

export async function submitPollVote(eventId: string, optionId: string, voterId: string) {
  return request<{ message: string }>(`/events/${eventId}/poll/votes`, {
    method: "POST",
    body: JSON.stringify({ optionId, voterId }),
  });
}

export async function closePoll(eventId: string, finalOptionId?: string) {
  return request<{ data: Poll }>(`/events/${eventId}/poll/close`, {
    method: "POST",
    body: JSON.stringify(
      finalOptionId ? { finalOptionId } : {}
    ),
  });
}

export function isApiError(error: unknown): error is ApiError {
  return Boolean(error && typeof error === "object" && "status" in error);
}

import { eventApi as axiosEventApi, communicationApi as axiosCommApi } from "@/utils/api";

// Event service wrappers delegating to axios instances
export const eventApi = {
  async createEvent(payload: {
    organizerId: string;
    title: string;
    description: string;
    location: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
  }) {
    const res = await axiosEventApi.post("/events", payload);
    return { data: res.data } as { data: { eventId: string } };
  },

  async createPoll(
    eventId: string,
    payload: {
      organizerId: string;
      closesAt?: string;
      options: { label: string; order?: number }[];
    },
  ) {
    const res = await axiosEventApi.post(`/events/${eventId}/poll`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: unknown };
  },

  async addPollOption(eventId: string, payload: { label: string; order?: number }) {
    const res = await axiosEventApi.post(`/events/${eventId}/poll/options`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: { id: string; label: string; order: number; tally: number } };
  },

  async getEvents() {
    const res = await axiosEventApi.get(`/events`);
    return { data: res.data?.data ?? [] } as { data: any[] };
  },

  async getEvent(eventId: string) {
    const res = await axiosEventApi.get(`/events/${eventId}`);
    return { data: res.data?.data } as { data: any };
  },

  async getPoll(eventId: string) {
    const res = await axiosEventApi.get(`/events/${eventId}/poll`);
    return { data: res.data?.data } as { data: any };
  },

  async submitVote(eventId: string, payload: { optionId: string; voterId: string }) {
    const res = await axiosEventApi.post(`/events/${eventId}/poll/votes`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: unknown };
  },

  async closePoll(eventId: string, payload: { finalOptionId?: string } = {}) {
    const res = await axiosEventApi.post(`/events/${eventId}/poll/close`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: unknown };
  },
};

// Communication service wrappers delegating to axios instances
export const commApi = {
  async listInviteTargets(groupId: string) {
    const res = await axiosCommApi.get(`/groups/${groupId}/invite-targets`);
    return { data: res.data?.data ?? [] } as { data: any[] };
  },

  async createInvitation(groupId: string, payload: {
    inviterId: string;
    inviteeId: string;
    expiresInMinutes?: number;
  }) {
    const res = await axiosCommApi.post(`/groups/${groupId}/invitations`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: { inviteCode: string; inviteLink: string; expiresAt: string } };
  },

  async getInvitation(inviteCode: string) {
    const res = await axiosCommApi.get(`/invitations/${inviteCode}`);
    return { data: res.data?.data } as { data: any };
  },

  async acceptInvitation(inviteCode: string, payload: { inviteeId?: string } = {}) {
    const res = await axiosCommApi.post(`/invitations/${inviteCode}/accept`, payload);
    return { message: res.data?.message ?? "", data: res.data?.data } as { message: string; data: { groupId: string; inviteeId: string } };
  },

  async declineInvitation(inviteCode: string, payload: { inviteeId?: string } = {}) {
    const res = await axiosCommApi.post(`/invitations/${inviteCode}/decline`, payload);
    return { message: res.data?.message ?? "" } as { message: string };
  },
};

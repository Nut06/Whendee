import { User } from "./user.type";

export type EventMemberStatus = "INVITED" | "ACCEPTED" | "DECLINED";

export interface EventMember {
  id: string;
  eventId: string;
  memberId: string;
  status: EventMemberStatus;
  invitedAt: string;
  joinedAt?: string;
  memberProfile?: User;
}

export type PollStatus = "OPEN" | "CLOSED";

export interface PollOption {
  id: string;
  label: string;
  tally: number;
  order: number;
}

export interface Poll {
  id: string;
  eventId: string;
  status: PollStatus;
  closesAt?: string;
  winnerOptionId?: string;
  options: PollOption[];
}

export interface PollTallies {
  pollId: string;
  tallies: Array<{
    optionId: string;
    tally: number;
  }>;
}

export interface Event {
  id: string;
  title: string;
  eventDescription: string;
  location?: string | null;
  repeat?: string | null;
  budget?: number | null;
  alertMinutes?: number | null;
  scheduledAt?: string | null;
  meetingLink?: string | null;
  capacity?: number | null;
  createdAt: string;
  updatedAt: string;
  polls?: Poll[];
  members?: EventMember[];
}

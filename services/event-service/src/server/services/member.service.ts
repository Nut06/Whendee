import { prisma } from './prisma.js';
import { HttpError } from '../middleware/http-error.js';

export async function addMemberToEvent(params: {
  eventId: string;
  userId: string;
  status?: 'INVITED' | 'ACCEPTED' | 'DECLINED';
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    select: { id: true },
  });

  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  try {
    return await prisma.eventMember.upsert({
      where: {
        eventId_userId: {
          eventId: params.eventId,
          userId: params.userId,
        },
      },
      update: {
        status: params.status ?? 'ACCEPTED',
        joinedAt: params.status === 'ACCEPTED' ? new Date() : null,
      },
      create: {
        eventId: params.eventId,
        userId: params.userId,
        status: params.status ?? 'ACCEPTED',
        joinedAt: params.status === 'ACCEPTED' ? new Date() : null,
      },
      select: {
        id: true,
        eventId: true,
        userId: true,
        status: true,
        joinedAt: true,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function listEventMembers(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  return prisma.eventMember.findMany({
    where: { eventId },
    orderBy: { invitedAt: 'asc' },
    select: {
      id: true,
      userId: true,
      status: true,
      invitedAt: true,
      joinedAt: true,
    },
  });
}

export async function ensureAcceptedMember(params: {
  eventId: string;
  userId: string;
}) {
  const membership = await prisma.eventMember.findUnique({
    where: {
      eventId_userId: {
        eventId: params.eventId,
        userId: params.userId,
      },
    },
    select: {
      status: true,
    },
  });

  if (!membership) {
    throw new HttpError(403, 'Member is not part of this event');
  }

  if (membership.status !== 'ACCEPTED') {
    throw new HttpError(403, 'Member has not accepted the invitation');
  }
}

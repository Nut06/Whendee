import { prisma } from './prisma.js';
import type { CreateEventInput } from '../validators/create-event.schema.js';

type UpdateEventInput = Partial<CreateEventInput>;

export async function createEvent(input: CreateEventInput) {
  return prisma.event.create({
    data: {
      title: input.title,
      eventDescription: input.eventDescription,
      location: input.location ?? null,
      repeat: input.repeat ?? null,
      budget: input.budget ?? null,
      alertMinutes: input.alertMinutes ?? null,
      scheduledAt: input.scheduledAt ?? null,
      meetingLink: input.meetingLink ?? null,
    },
    select: {
      id: true,
    },
  });
}

<<<<<<< HEAD
export async function updateEvent(eventId: string, input: UpdateEventInput) {
  const data: Record<string, unknown> = {};
  const mapField = <K extends keyof UpdateEventInput>(key: K) => {
    if (input[key] !== undefined) {
      data[key] = input[key];
    }
  };

  mapField('title');
  mapField('eventDescription');
  if (input.location !== undefined) data.location = input.location ?? null;
  mapField('repeat');
  mapField('budget');
  mapField('alertMinutes');
  if (input.scheduledAt !== undefined) {
    data.scheduledAt = input.scheduledAt ?? null;
  }
  if (input.meetingLink !== undefined) {
    data.meetingLink = input.meetingLink ?? null;
  }

  return prisma.event.update({
    where: { id: eventId },
    data,
    select: { id: true },
  });
=======
export async function listEvents() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      polls: {
        include: {
          options: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              label: true,
              tally: true,
              order: true,
            },
          },
        },
      },
    },
  });

  return events.map(mapEventSummary);
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      polls: {
        include: {
          options: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              label: true,
              tally: true,
              order: true,
            },
          },
          votes: true,
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  return mapEventDetail(event);
}

function mapEventSummary(event: any) {
  const poll = event.polls?.[0] ?? null;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    organizerId: event.organizerId,
    capacity: event.capacity,
    poll: poll
      ? {
          id: poll.id,
          status: poll.status,
          closesAt: poll.closesAt,
          winnerOptionId: poll.winnerOptionId,
          options: poll.options.map((option: any) => ({
            id: option.id,
            label: option.label,
            tally: option.tally,
            order: option.order,
          })),
        }
      : null,
  };
}

function mapEventDetail(event: any) {
  const summary = mapEventSummary(event);
  const poll = event.polls?.[0] ?? null;
  return {
    ...summary,
    poll: poll
      ? {
          ...summary.poll,
          votes: poll.votes?.length ?? 0,
        }
      : null,
  };
>>>>>>> origin/fix-authen-branch
}

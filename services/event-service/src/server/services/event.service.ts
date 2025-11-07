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
}

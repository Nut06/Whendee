import { prisma } from './prisma.js';
import type { CreateEventInput } from '../validators/create-event.schema.js';

export async function createEvent(input: CreateEventInput) {
  return prisma.event.create({
    data: {
      title: input.title,
      eventDescription: input.eventDescription,
      location: input.location ?? null,
      repeat: input.repeat ?? null,
      budget: input.budget ?? null,
      alertMinutes: input.alertMinutes ?? null,
      capacity: input.capacity ?? null,
    },
    select: {
      id: true,
    },
  });
}

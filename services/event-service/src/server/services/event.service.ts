import { prisma } from './prisma.js';
import type { CreateEventInput } from '../validators/create-event.schema.js';

export async function createEvent(input: CreateEventInput) {
  return prisma.event.create({
    data: {
      organizerId: input.organizerId,
      title: input.title,
      description: input.description,
      location: input.location,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity ?? null,
    },
    select: {
      id: true,
    },
  });
}

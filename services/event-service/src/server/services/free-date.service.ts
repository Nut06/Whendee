import { prisma } from './prisma.js';

export async function setUserFreeDates(params: {
  eventId: string;
  userId: string;
  dates: string[];
}) {
  await prisma.$transaction([
    prisma.eventFreeDate.deleteMany({
      where: { eventId: params.eventId, userId: params.userId },
    }),
    prisma.eventFreeDate.createMany({
      data: params.dates.map((dateKey) => ({
        eventId: params.eventId,
        userId: params.userId,
        dateKey: new Date(dateKey),
      })),
    }),
  ]);
}

export async function listFreeDates(eventId: string) {
  const rows = await prisma.eventFreeDate.findMany({
    where: { eventId },
    orderBy: { userId: 'asc' },
  });

  const map = new Map<string, string[]>();
  rows.forEach((row) => {
    const key = row.userId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(row.dateKey.toISOString().slice(0, 10));
  });

  return Array.from(map.entries()).map(([userId, dates]) => ({ userId, dates }));
}

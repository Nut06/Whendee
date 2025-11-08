import { describe, expect, it, vi } from 'vitest';

vi.mock('../prisma.js', () => {
  const deleteMany = vi.fn().mockResolvedValue(undefined);
  const createMany = vi.fn().mockResolvedValue({ count: 2 });
  const findMany = vi.fn();
  return {
    prisma: {
      eventFreeDate: {
        deleteMany,
        createMany,
        findMany,
      },
      $transaction: vi.fn().mockImplementation(async (operations: any[]) => {
        await Promise.all(operations);
      }),
    },
  };
});

import { prisma } from '../prisma.js';
import { listFreeDates, setUserFreeDates } from '../free-date.service.js';

describe('Free date service (TC-AddFreeTime)', () => {
  it('TC-AddFreeTime01: overwrites previous busy dates when marking a day available', async () => {
    await setUserFreeDates({
      eventId: 'evt-1',
      userId: 'user-1',
      dates: ['2024-10-15', '2024-10-16'],
    });

    expect(prisma.eventFreeDate.deleteMany).toHaveBeenCalledWith({
      where: { eventId: 'evt-1', userId: 'user-1' },
    });
    expect(prisma.eventFreeDate.createMany).toHaveBeenCalledWith({
      data: [
        {
          eventId: 'evt-1',
          userId: 'user-1',
          dateKey: new Date('2024-10-15'),
        },
        {
          eventId: 'evt-1',
          userId: 'user-1',
          dateKey: new Date('2024-10-16'),
        },
      ],
    });
  });

  it('TC-AddFreeTime02: lists combined availability grouped by member', async () => {
    const rows = [
      { userId: 'alice', dateKey: new Date('2024-10-15T00:00:00Z') },
      { userId: 'alice', dateKey: new Date('2024-10-16T00:00:00Z') },
      { userId: 'bob', dateKey: new Date('2024-10-17T00:00:00Z') },
    ];
    (prisma.eventFreeDate.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      rows,
    );

    const result = await listFreeDates('evt-1');

    expect(result).toEqual([
      { userId: 'alice', dates: ['2024-10-15', '2024-10-16'] },
      { userId: 'bob', dates: ['2024-10-17'] },
    ]);
  });
});

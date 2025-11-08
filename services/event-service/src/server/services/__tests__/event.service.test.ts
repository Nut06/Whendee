import { describe, expect, it, vi } from 'vitest';

vi.mock('../prisma.js', () => {
  return {
    prisma: {
      event: {
        create: vi.fn(),
      },
    },
  };
});

import { prisma } from '../prisma.js';
import { createEvent } from '../event.service.js';

describe('Event service', () => {
  it('TC-CreateEvnt01: persists the new event data and returns the identifier', async () => {
    const payload = {
      title: 'ปาร์ตี้วันเกิด',
      eventDescription: 'ฉลองวันเกิดอายุ 25',
      location: undefined,
      budget: null,
      alertMinutes: 30,
    };
    const expectedId = 'evt-123';
    const eventCreateMock =
      prisma.event.create as unknown as ReturnType<typeof vi.fn>;
    eventCreateMock.mockResolvedValue({ id: expectedId });

    const result = await createEvent(payload as any);

    expect(prisma.event.create).toHaveBeenCalledWith({
      data: {
        title: payload.title,
        eventDescription: payload.eventDescription,
        location: null,
        repeat: null,
        budget: null,
        alertMinutes: payload.alertMinutes,
        scheduledAt: null,
        meetingLink: null,
      },
      select: { id: true },
    });
    expect(result).toEqual({ id: expectedId });
  });
});

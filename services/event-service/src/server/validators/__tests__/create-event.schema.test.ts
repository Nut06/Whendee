import { describe, expect, it } from 'vitest';

import { createEventSchema } from '../create-event.schema.js';

describe('Event creation validation (TC-CreateEvnt)', () => {
  it('TC-CreateEvnt01: accepts valid payloads for creating a new activity', () => {
    const payload = {
      title: 'ปาร์ตี้วันเกิด',
      eventDescription: 'ฉลองวันเกิดอายุ 25',
      location: 'Bangkok',
      scheduledAt: '2025-10-15T10:00:00.000Z',
      meetingLink: 'https://meet.whendee.app/event',
      repeat: 'WEEKLY',
      budget: 1500,
      alertMinutes: 60,
    };

    const parsed = createEventSchema.parse(payload);

    expect(parsed.title).toBe(payload.title);
    expect(parsed.eventDescription).toBe(payload.eventDescription);
    expect(parsed.scheduledAt).toBeInstanceOf(Date);
  });

  it('TC-CreateEvnt02: rejects missing required fields with actionable errors', () => {
    expect(() =>
      createEventSchema.parse({
        title: '  ',
        eventDescription: '',
      }),
    ).toThrow(/title must be at least 3 characters/);
  });
});

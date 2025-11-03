import { z } from 'zod';

const isoDateSchema = z
  .string()
  .trim()
  .min(1, 'Date is required')
  .transform((value, ctx) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date format; expected ISO string',
      });
      return z.NEVER;
    }

    return parsed;
  });

export const organizerSchema = z.object({
  organizerId: z
    .string()
    .trim()
    .min(1, 'organizerId is required'),
});

export const createEventSchema = organizerSchema
  .extend({
    title: z
      .string()
      .trim()
      .min(3, 'title must be at least 3 characters')
      .max(120, 'title must be under 120 characters'),
    description: z
      .string()
      .trim()
      .min(10, 'description must be at least 10 characters')
      .max(2000, 'description must be under 2000 characters'),
    location: z
      .string()
      .trim()
      .min(3, 'location must be at least 3 characters')
      .max(255, 'location must be under 255 characters'),
    startsAt: isoDateSchema,
    endsAt: isoDateSchema,
    capacity: z
      .coerce
      .number()
      .int()
      .positive('capacity must be greater than zero')
      .max(100000, 'capacity is unrealistically high')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'endsAt must be later than startsAt',
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

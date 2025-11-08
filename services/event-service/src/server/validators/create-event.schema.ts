import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'title must be at least 3 characters')
    .max(120, 'title must be under 120 characters'),
  eventDescription: z
    .string()
    .trim()
    .max(2000, 'description must be under 2000 characters'),
  location: z
    .string()
    .trim()
    .min(3, 'location must be at least 3 characters')
    .max(255, 'location must be under 255 characters')
    .optional(),
  scheduledAt: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine(
      (value) => !value || !Number.isNaN(value.getTime()),
      'scheduledAt must be an ISO date string',
    ),
  meetingLink: z
    .string()
    .trim()
    .url('meetingLink must be a valid URL')
    .optional(),
  repeat: z
    .string()
    .trim()
    .max(120, 'repeat label must be under 120 characters')
    .optional(),
  budget: z
    .coerce
    .number()
    .int()
    .nonnegative('budget cannot be negative')
    .max(1_000_000_000, 'budget is unrealistically high')
    .optional(),
  alertMinutes: z
    .coerce
    .number()
    .int()
    .min(0, 'alertMinutes must be zero or greater')
    .max(60 * 24 * 30, 'alertMinutes should be within 30 days')
    .optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;

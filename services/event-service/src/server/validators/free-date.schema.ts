import { z } from 'zod';

export const saveFreeDatesBodySchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
  dates: z
    .array(
      z
        .string()
        .trim()
        .regex(/\d{4}-\d{2}-\d{2}/, 'dates must be in YYYY-MM-DD format'),
    )
    .min(1, 'at least one date is required'),
});

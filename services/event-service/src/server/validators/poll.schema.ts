import { z } from 'zod';

export const eventIdParamSchema = z.object({
  eventId: z
    .string()
    .trim()
    .min(1, 'eventId is required'),
});

export const submitVoteBodySchema = z.object({
  optionId: z
    .string()
    .trim()
    .min(1, 'optionId is required'),
  voterId: z
    .string()
    .trim()
    .min(1, 'voterId is required'),
});

export const closePollBodySchema = z
  .object({
    finalOptionId: z
      .string()
      .trim()
      .min(1, 'finalOptionId cannot be empty')
      .optional(),
  })
  .optional();

export type SubmitVoteBody = z.infer<typeof submitVoteBodySchema>;
export type ClosePollBody = z.infer<typeof closePollBodySchema>;

export const pollOptionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'option label is required')
    .max(120),
  order: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export const createPollBodySchema = z.object({
  closesAt: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine(
      (value) => !value || !Number.isNaN(value.getTime()),
      'closesAt must be an ISO date string',
    ),
  options: z.array(pollOptionSchema).default([]),
});

export const addOptionBodySchema = pollOptionSchema.extend({
  userId: z.string().trim().min(1, 'userId is required'),
  pollId: z.string().trim().min(1, 'pollId is required').optional(),
});

export type CreatePollBody = z.infer<typeof createPollBodySchema>;
export type AddOptionBody = z.infer<typeof addOptionBodySchema>;

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

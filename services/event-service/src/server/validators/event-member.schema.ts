import { z } from 'zod';

export const eventParamsSchema = z.object({
  eventId: z.string().trim().min(1, 'eventId is required'),
});

export const addMemberBodySchema = z.object({
  memberId: z.string().trim().min(1, 'memberId is required'),
  status: z.enum(['INVITED', 'ACCEPTED', 'DECLINED']).optional(),
});

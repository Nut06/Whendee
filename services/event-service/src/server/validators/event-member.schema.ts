import { z } from 'zod';

export const eventParamsSchema = z.object({
  eventId: z.string().trim().min(1, 'eventId is required'),
});

export const addMemberBodySchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
  status: z.enum(['INVITED', 'ACCEPTED', 'DECLINED']).optional(),
  inviterId: z.string().trim().optional(),
  inviterName: z.string().trim().optional(),
});

export const userIdQuerySchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
});

export const respondInvitationBodySchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
});

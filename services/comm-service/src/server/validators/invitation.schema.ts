import { z } from 'zod';

export const groupIdParamsSchema = z.object({
  groupId: z.string().trim().min(1, 'groupId is required'),
});

export const createInvitationBodySchema = z.object({
  inviterId: z.string().trim().min(1, 'inviterId is required'),
  inviteeId: z.string().trim().min(1, 'inviteeId is required'),
  expiresInMinutes: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const inviteLinkParamsSchema = z.object({
  inviteCode: z.string().trim().min(1, 'inviteCode is required'),
});

export const invitationActionBodySchema = z
  .object({
    inviteeId: z.string().trim().min(1, 'inviteeId must not be empty').optional(),
  })
  .optional();

export type CreateInvitationBody = z.infer<typeof createInvitationBodySchema>;
export type InvitationActionBody = z.infer<typeof invitationActionBodySchema>;

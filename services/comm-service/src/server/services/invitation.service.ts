import crypto from 'node:crypto';


import { env } from '../../config/env.js';
import { HttpError } from '../middleware/http-error.js';
import { prisma } from './prisma.js';
import {
  notifyGroupJoined,
  sendInvitationMessage,
} from './notification.service.js';

export interface InviteTarget {
  friendId: string;
  displayName: string;
  avatarUrl?: string;
}

const db = prisma as unknown as {
  invitation: {
    findUnique: (...args: unknown[]) => Promise<any>;
    findFirst: (...args: unknown[]) => Promise<any>;
    create: (...args: unknown[]) => Promise<any>;
    update: (...args: unknown[]) => Promise<any>;
  };
};

// Temporary stub dataset
const MOCK_GROUP_TARGETS: Record<string, InviteTarget[]> = {
  group_demo: [
    { friendId: 'user_friend_1', displayName: 'Ning' },
    { friendId: 'user_friend_2', displayName: 'First' },
    { friendId: 'user_friend_3', displayName: 'View' },
  ],
};

export async function listInviteTargets(groupId: string) {
  return MOCK_GROUP_TARGETS[groupId] ?? [];
}

export async function createInvitation(params: {
  groupId: string;
  inviterId: string;
  inviteeId: string;
  expiresInMinutes?: number;
}) {
  const existing = await db.invitation.findFirst({
    where: {
      groupId: params.groupId,
      inviteeId: params.inviteeId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  });

  if (existing) {
    throw new HttpError(
      409,
      'Invitation already exists for this member and group',
      { inviteLink: existing.inviteLink },
    );
  }

  const inviteCode = crypto.randomUUID();
  const inviteLink = `${env.INVITE_LINK_BASE_URL}/${inviteCode}`;
  const expiresAt = new Date(
    Date.now() +
      1000 * 60 * (params.expiresInMinutes ?? env.INVITATION_TTL_MINUTES),
  );

  try {
    const invitation = await db.invitation.create({
      data: {
        groupId: params.groupId,
        inviterId: params.inviterId,
        inviteeId: params.inviteeId,
        inviteCode,
        inviteLink,
        expiresAt,
      },
    });

    await sendInvitationMessage({
      groupId: params.groupId,
      inviterId: params.inviterId,
      inviteeId: params.inviteeId,
      inviteLink,
      expiresAt,
    });

    return invitation;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HttpError(409, 'Invitation already exists', {
        inviteLink,
      });
    }
    throw error;
  }
}

export async function acceptInvitation(params: {
  inviteCode: string;
  inviteeId?: string;
}) {
  const invitation = await getInvitationByCode(params.inviteCode);

  if (params.inviteeId && invitation.inviteeId !== params.inviteeId) {
    throw new HttpError(403, 'Invitation is not intended for this user');
  }

  if (invitation.status === 'ACCEPTED') {
    return invitation;
  }

  if (invitation.status === 'DECLINED') {
    throw new HttpError(409, 'Invitation was previously declined');
  }

  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    await markExpired(invitation.id);
    throw new HttpError(410, 'Invitation expired');
  }

  const updated = await db.invitation.update({
    where: { id: invitation.id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  await notifyGroupJoined({
    groupId: updated.groupId,
    inviteeId: updated.inviteeId,
  });

  return updated;
}

export async function declineInvitation(params: {
  inviteCode: string;
  inviteeId?: string;
}) {
  const invitation = await getInvitationByCode(params.inviteCode);

  if (params.inviteeId && invitation.inviteeId !== params.inviteeId) {
    throw new HttpError(403, 'Invitation is not intended for this user');
  }

  if (invitation.status === 'DECLINED') {
    return invitation;
  }

  if (invitation.status === 'ACCEPTED') {
    throw new HttpError(409, 'Invitation already accepted');
  }

  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    await markExpired(invitation.id);
    throw new HttpError(410, 'Invitation expired');
  }

  return db.invitation.update({
    where: { id: invitation.id },
    data: {
      status: 'DECLINED',
      declinedAt: new Date(),
    },
  });
}

export async function getInvitationByCode(inviteCode: string) {
  const invitation = await db.invitation.findUnique({
    where: { inviteCode },
  });

  if (!invitation) {
    throw new HttpError(404, 'Invitation not found');
  }

  return invitation;
}

async function markExpired(invitationId: string) {
  await db.invitation.update({
    where: { id: invitationId },
    data: {
      status: 'EXPIRED',
    },
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'code' in error && (error as { code?: string }).code === 'P2002';
}

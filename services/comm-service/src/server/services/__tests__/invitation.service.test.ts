import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/env.js', () => ({
  env: {
    INVITE_LINK_BASE_URL: 'https://whendee.app/invite',
    INVITATION_TTL_MINUTES: 60,
  },
}));

vi.mock('../prisma.js', () => {
  const client = {
    invitation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  return { prisma: client };
});

vi.mock('./notification.service.js', () => ({
  sendInvitationMessage: vi.fn(),
  notifyGroupJoined: vi.fn(),
}));

import { prisma } from '../prisma.js';
import {
  acceptInvitation,
  createInvitation,
  declineInvitation,
  getInvitationByCode,
  listInviteTargets,
} from '../invitation.service.js';
import { notifyGroupJoined, sendInvitationMessage } from './notification.service.js';
import { HttpError } from '../../middleware/http-error.js';

const prismaMock = prisma as unknown as {
  invitation: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Invitation lifecycle (TC-Invite)', () => {
  it('TC-Invite01: accepts in-system invitations and notifies the group', async () => {
    const invitation = {
      id: 'inv-1',
      groupId: 'group-1',
      inviteeId: 'friend-1',
      inviteCode: 'code-1',
      inviteLink: 'https://whendee.app/invite/code-1',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 60_000),
    };
    prismaMock.invitation.findUnique.mockResolvedValue(invitation);
    prismaMock.invitation.update.mockResolvedValue({
      ...invitation,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });

    const result = await acceptInvitation({ inviteCode: 'code-1', inviteeId: 'friend-1' });

    expect(result.status).toBe('ACCEPTED');
    expect(notifyGroupJoined).toHaveBeenCalledWith({
      groupId: 'group-1',
      inviteeId: 'friend-1',
    });
  });

  it('TC-Invite02: creates shareable invitations for contacts', async () => {
    prismaMock.invitation.findFirst.mockResolvedValue(null);
    prismaMock.invitation.create.mockImplementation(async ({ data }) => ({
      id: 'inv-2',
      ...data,
    }));

    const result = await createInvitation({
      groupId: 'group-2',
      inviterId: 'organizer',
      inviteeId: 'friend-2',
      expiresInMinutes: 30,
    });

    expect(result.inviteLink).toMatch(/https:\/\/whendee\.app\/invite/);
    expect(sendInvitationMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: 'group-2',
        inviteeId: 'friend-2',
      }),
    );
  });

  it('TC-Invite03: records rejection when invitees decline', async () => {
    const invitation = {
      id: 'inv-3',
      groupId: 'group-3',
      inviteeId: 'friend-3',
      inviteCode: 'code-3',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 1000),
    };
    prismaMock.invitation.findUnique.mockResolvedValue(invitation);
    prismaMock.invitation.update.mockResolvedValue({
      ...invitation,
      status: 'DECLINED',
      declinedAt: new Date(),
    });

    const result = await declineInvitation({ inviteCode: 'code-3', inviteeId: 'friend-3' });

    expect(result.status).toBe('DECLINED');
  });

  it('TC-Invite04: rejects expired links and marks them as expired', async () => {
    const expired = {
      id: 'inv-4',
      groupId: 'group-4',
      inviteeId: 'friend-4',
      inviteCode: 'code-4',
      status: 'PENDING',
      expiresAt: new Date(Date.now() - 1000),
    };
    prismaMock.invitation.findUnique.mockResolvedValue(expired);
    prismaMock.invitation.update.mockResolvedValue({ ...expired, status: 'EXPIRED' });

    await expect(acceptInvitation({ inviteCode: 'code-4' })).rejects.toEqual(
      expect.objectContaining({
        statusCode: 410,
      }),
    );
  });

  it('TC-Invite02 (link sharing): lists mock friend targets for the default group', () => {
    expect(listInviteTargets('group_demo')).toHaveLength(3);
  });
});

// Ensure helper remains covered
it('getInvitationByCode propagates 404s for unknown codes', async () => {
  prismaMock.invitation.findUnique.mockResolvedValue(null);
  await expect(getInvitationByCode('missing')).rejects.toBeInstanceOf(HttpError);
});

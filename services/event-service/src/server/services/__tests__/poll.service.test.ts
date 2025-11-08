import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../prisma.js', () => {
  const client: any = {
    poll: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    pollVote: {
      create: vi.fn(),
    },
    pollOption: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    event: {
      update: vi.fn(),
    },
  };
  client.$transaction = vi.fn().mockImplementation(async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(client);
    }
    await Promise.all(arg);
    return undefined;
  });
  return { prisma: client };
});

vi.mock('./member.service.js', () => ({
  ensureAcceptedMember: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./notifier.service.js', () => ({
  publishTallyUpdate: vi.fn(),
  publishPollClosed: vi.fn(),
}));

import { prisma } from '../prisma.js';
import { submitVote, closePoll } from '../poll.service.js';
import { HttpError } from '../../middleware/http-error.js';
import { ensureAcceptedMember } from './member.service.js';
import { publishPollClosed, publishTallyUpdate } from './notifier.service.js';

const prismaMock = prisma as unknown as {
  poll: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  pollVote: {
    create: ReturnType<typeof vi.fn>;
  };
  pollOption: {
    update: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  event: {
    update: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Poll service voting (TC-Voting)', () => {
  it('TC-Voting01/02: accepts votes from accepted members and publishes tally updates', async () => {
    const pollRecord = {
      id: 'poll-1',
      status: 'OPEN',
      eventId: 'event-1',
      closesAt: null,
      winnerOptionId: null,
      options: [
        { id: 'opt-1', label: 'Dinner', tally: 1, order: 0 },
        { id: 'opt-2', label: 'Bowling', tally: 0, order: 1 },
      ],
    };
    prismaMock.poll.findUnique.mockResolvedValue(pollRecord);
    prismaMock.pollOption.findMany.mockResolvedValue([
      { id: 'opt-1', tally: 2 },
      { id: 'opt-2', tally: 0 },
    ]);

    const result = await submitVote({
      eventId: 'event-1',
      optionId: 'opt-1',
      voterId: 'alice',
    });

    expect(ensureAcceptedMember).toHaveBeenCalledWith({
      eventId: 'event-1',
      userId: 'alice',
    });
    expect(prismaMock.pollVote.create).toHaveBeenCalledWith({
      data: { pollId: 'poll-1', optionId: 'opt-1', voterId: 'alice' },
    });
    expect(result.tallies).toEqual([
      { id: 'opt-1', tally: 2 },
      { id: 'opt-2', tally: 0 },
    ]);
    expect(publishTallyUpdate).toHaveBeenCalledWith({
      eventId: 'event-1',
      pollId: 'poll-1',
      tallies: [
        { optionId: 'opt-1', tally: 2 },
        { optionId: 'opt-2', tally: 0 },
      ],
    });
  });

  it('TC-Voting03: prevents voting when the poll is already closed', async () => {
    prismaMock.poll.findUnique.mockResolvedValue({
      id: 'poll-1',
      status: 'CLOSED',
      eventId: 'event-1',
      options: [],
    });

    await expect(
      submitVote({ eventId: 'event-1', optionId: 'opt', voterId: 'bob' }),
    ).rejects.toBeInstanceOf(HttpError);
  });

  it('TC-Voting04: resolves tied polls when the organizer supplies a final option', async () => {
    const tiedPoll = {
      id: 'poll-9',
      status: 'OPEN',
      eventId: 'event-1',
      closesAt: null,
      winnerOptionId: null,
      options: [
        { id: 'opt-a', label: 'Cafe', tally: 3, order: 0 },
        { id: 'opt-b', label: 'Karaoke', tally: 3, order: 1 },
      ],
    };
    prismaMock.poll.findUnique.mockResolvedValue(tiedPoll);
    prismaMock.poll.update.mockResolvedValue({
      ...tiedPoll,
      status: 'CLOSED',
      winnerOptionId: 'opt-b',
    });

    const result = await closePoll({ eventId: 'event-1', finalOptionId: 'opt-b' });

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { location: 'Karaoke' },
    });
    expect(publishPollClosed).toHaveBeenCalledWith({
      eventId: 'event-1',
      pollId: 'poll-9',
      winnerOptionId: 'opt-b',
    });
    expect(result.winnerOptionId).toBe('opt-b');
  });
});

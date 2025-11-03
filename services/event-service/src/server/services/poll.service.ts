import { Prisma } from '@prisma/client';

import { HttpError } from '../middleware/http-error.js';
import { publishPollClosed, publishTallyUpdate } from './notifier.service.js';
import { prisma } from './prisma.js';

interface PollWithOptions {
  id: string;
  status: string;
  eventId: string;
  closesAt: Date | null;
  winnerOptionId: string | null;
  options: Array<{
    id: string;
    label: string;
    tally: number;
    order: number;
  }>;
}

const db = prisma as unknown as {
  poll: any;
  pollVote: any;
  pollOption: any;
  $transaction: typeof prisma.$transaction;
};

export async function getPollForEvent(eventId: string) {
  const poll = (await db.poll.findUnique({
    where: { eventId },
    include: {
      options: {
        orderBy: { order: 'asc' },
      },
    },
  })) as PollWithOptions | null;

  if (!poll) {
    throw new HttpError(404, `Poll for event ${eventId} not found`);
  }

  return mapPoll(poll);
}

export async function submitVote(params: {
  eventId: string;
  optionId: string;
  voterId: string;
}) {
  const poll = (await db.poll.findUnique({
    where: { eventId: params.eventId },
    include: {
      options: true,
    },
  })) as PollWithOptions | null;

  if (!poll) {
    throw new HttpError(404, `Poll for event ${params.eventId} not found`);
  }

  if (poll.status !== 'OPEN') {
    throw new HttpError(400, 'Poll is not accepting votes');
  }

  const option = poll.options.find((item) => item.id === params.optionId);

  if (!option) {
    throw new HttpError(400, 'Option does not belong to this poll');
  }

  try {
    await db.$transaction([
      db.pollVote.create({
        data: {
          pollId: poll.id,
          optionId: params.optionId,
          voterId: params.voterId,
        },
      }),
      db.pollOption.update({
        where: { id: params.optionId },
        data: {
          tally: { increment: 1 },
        },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new HttpError(409, 'You have already voted in this poll');
    }

    throw error;
  }

  const updatedOptions = (await db.pollOption.findMany({
    where: { pollId: poll.id },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      tally: true,
    },
  })) as Array<{ id: string; tally: number }>;

  await publishTallyUpdate({
    eventId: params.eventId,
    pollId: poll.id,
    tallies: updatedOptions.map((item) => ({
      optionId: item.id,
      tally: item.tally,
    })),
  });

  return {
    pollId: poll.id,
    tallies: updatedOptions,
  };
}

export async function closePoll(params: {
  eventId: string;
  finalOptionId?: string;
}) {
  const poll = (await db.poll.findUnique({
    where: { eventId: params.eventId },
    include: {
      options: {
        orderBy: { order: 'asc' },
      },
    },
  })) as PollWithOptions | null;

  if (!poll) {
    throw new HttpError(404, `Poll for event ${params.eventId} not found`);
  }

  if (poll.status === 'CLOSED') {
    return mapPoll(poll);
  }

  if (poll.options.length === 0) {
    throw new HttpError(400, 'Poll has no options to determine a winner');
  }

  const highestTally = Math.max(...poll.options.map((item) => item.tally));
  const topOptions = poll.options.filter(
    (item) => item.tally === highestTally,
  );

  let winnerOptionId: string | undefined;

  if (params.finalOptionId) {
    const finalOption = poll.options.find(
      (item) => item.id === params.finalOptionId,
    );

    if (!finalOption) {
      throw new HttpError(400, 'finalOptionId does not belong to this poll');
    }

    winnerOptionId = finalOption.id;
  } else if (topOptions.length === 1) {
    winnerOptionId = topOptions[0]?.id;
  } else {
    throw new HttpError(409, 'Poll ended in a tie', {
      tiedOptionIds: topOptions.map((option) => option.id),
    });
  }

  if (!winnerOptionId) {
    throw new HttpError(500, 'Unable to resolve poll winner');
  }

  const updatedPoll = (await db.poll.update({
    where: { id: poll.id },
    data: {
      status: 'CLOSED',
      closesAt: new Date(),
      winnerOptionId,
    },
    include: {
      options: {
        orderBy: { order: 'asc' },
      },
    },
  })) as PollWithOptions;

  await publishPollClosed({
    eventId: params.eventId,
    pollId: poll.id,
    winnerOptionId,
  });

  return mapPoll(updatedPoll);
}

function mapPoll(poll: PollWithOptions) {
  return {
    id: poll.id,
    eventId: poll.eventId,
    status: poll.status,
    closesAt: poll.closesAt,
    winnerOptionId: poll.winnerOptionId,
    options: poll.options
      .map((option) => ({
        id: option.id,
        label: option.label,
        tally: option.tally,
        order: option.order,
      }))
      .sort((a, b) => a.order - b.order),
  };
}

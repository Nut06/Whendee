import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../../services/prisma.js';

export async function listEventsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: true,
      },
    });

    return res.json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

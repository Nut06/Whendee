import type { NextFunction, Request, Response } from 'express';

<<<<<<< HEAD
import { prisma } from '../../services/prisma.js';
=======
import { listEvents } from '../../services/event.service.js';
>>>>>>> origin/fix-authen-branch

export async function listEventsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
<<<<<<< HEAD
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: true,
      },
    });

    return res.json({
=======
    const events = await listEvents();

    return res.status(200).json({
>>>>>>> origin/fix-authen-branch
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

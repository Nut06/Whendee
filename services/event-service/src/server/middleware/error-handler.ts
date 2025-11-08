import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { HttpError } from './http-error.js';

// Centralized error handler keeps consistent JSON responses.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    const httpError = err as HttpError;
    return res.status(httpError.statusCode).json({
      message: httpError.message,
      details: httpError.details ?? null,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid event data',
      errors: err.issues,
    });
  }

  const error =
    err instanceof Error
      ? err
      : new Error(
          typeof err === 'string' ? err : 'Unexpected error with unknown payload',
        );

  console.error('Unexpected error', error);

  return res.status(500).json({
    message: 'Internal server error',
  });
}

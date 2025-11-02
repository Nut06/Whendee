import { env } from '../../config/env.js';
import { HttpError } from '../middleware/http-error.js';

interface UserResponse {
  userId?: string;
  status?: string;
  isActive?: boolean;
}

const ACTIVE_STATUSES = new Set(['active', 'verified', 'approved']);

export async function ensureUserIsActive(userId: string, action: string) {
  if (env.SKIP_USER_VALIDATION) {
    return;
  }

  const baseUrl = env.USER_SERVICE_URL;

  if (!baseUrl) {
    throw new HttpError(
      500,
      'USER_SERVICE_URL is not configured; cannot validate user',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  let response: globalThis.Response;

  try {
    response = await fetch(
      `${baseUrl}/internal/users/${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );
  } catch (error) {
    clearTimeout(timeout);

    if ((error as Error).name === 'AbortError') {
      throw new HttpError(504, 'User validation timed out');
    }

    throw new HttpError(503, 'Unable to reach user service');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new HttpError(401, `User ${userId} not found for action ${action}`);
  }

  if (!response.ok) {
    throw new HttpError(503, 'User service returned an unexpected error');
  }

  let payload: UserResponse | null = null;

  try {
    payload = (await response.json()) as UserResponse;
  } catch {
    // ignore parsing errors
  }

  const isActive =
    payload?.isActive === true ||
    (payload?.status &&
      ACTIVE_STATUSES.has(payload.status.toLocaleLowerCase()));

  if (!isActive) {
    throw new HttpError(401, `User is not permitted to ${action}`);
  }
}

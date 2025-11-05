import { env } from '../../config/env.js';
import { HttpError } from '../middleware/http-error.js';

interface UserValidationResponse {
  userId?: string;
  status?: string;
  isActive?: boolean;
}

const ACTIVE_STATUSES = new Set(['active', 'verified', 'approved']);

interface EnsureUserOptions {
  reason?: string;
}

export async function ensureUserIsActive(
  userId: string,
  options: EnsureUserOptions = {},
) {
  if (env.SKIP_USER_VALIDATION) {
    return;
  }

  if (!env.USER_SERVICE_URL) {
    throw new HttpError(
      500,
      'USER_SERVICE_URL is not configured; cannot validate organizer',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    env.USER_SERVICE_TIMEOUT_MS,
  );

  let response: globalThis.Response;

  try {
    response = await fetch(
      `${env.USER_SERVICE_URL}/internal/users/${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
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
    throw new HttpError(401, 'Unauthorized: user not found');
  }

  if (!response.ok) {
    throw new HttpError(503, 'User service returned an unexpected error');
  }

  let payload: UserValidationResponse | null = null;

  try {
    payload = (await response.json()) as UserValidationResponse;
  } catch {
    // If payload cannot be parsed we fall back to status code only.
  }

  const isActive =
    payload?.isActive === true ||
    (payload?.status &&
      ACTIVE_STATUSES.has(payload.status.toLocaleLowerCase()));

  if (!isActive) {
    const reason =
      options.reason != null ? ` ${options.reason}` : ' perform this action';

    throw new HttpError(
      401,
      `Unauthorized: user is not allowed to${reason}`,
    );
  }
}

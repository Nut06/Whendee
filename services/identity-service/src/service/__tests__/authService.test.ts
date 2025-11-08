import { beforeEach, describe, expect, it, vi } from 'vitest';

import authService from '../authService.js';
import UserRepo from '@/repo/userRepo';
import Bcrypt from '@/utils/bcrypt';
import { AppError } from '@/types/appError';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@/utils/jwt';

vi.mock('@/repo/userRepo', () => {
  return {
    default: {
      findUserbyEmail: vi.fn(),
      upsertAccessToken: vi.fn(),
      replaceRefreshToken: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      findUserById: vi.fn(),
      findRefreshToken: vi.fn(),
      deleteRefreshToken: vi.fn(),
    },
  };
});

vi.mock('@/utils/bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('@/utils/jwt', () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

const mockedUserRepo = vi.mocked(UserRepo);
const mockedBcrypt = vi.mocked(Bcrypt);
const mockedGenerateAccessToken = vi.mocked(generateAccessToken);
const mockedGenerateRefreshToken = vi.mocked(generateRefreshToken);

const accessToken = {
  token: 'access-123',
  expiresAt: new Date('2025-01-01T00:00:00.000Z'),
};
const refreshToken = {
  token: 'refresh-abc',
  expiresAt: new Date('2025-01-08T00:00:00.000Z'),
};

function mockSessionTokens() {
  mockedGenerateAccessToken.mockReturnValue(accessToken);
  mockedGenerateRefreshToken.mockReturnValue(refreshToken);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSessionTokens();
  mockedBcrypt.hash.mockResolvedValue('hashed-random');
});

describe('Authentication flows from TC-Authen', () => {
  it('TC-Authen01: loginUser returns session tokens for valid internal credentials', async () => {
    mockedUserRepo.findUserbyEmail.mockResolvedValue({
      id: 'user-123',
      email: 'valid@whendee.app',
      password: 'hashed',
    } as any);
    mockedBcrypt.compare.mockResolvedValue(true);

    const tokens = await authService.loginUser('valid@whendee.app', 'Secr3t!');

    expect(tokens).toEqual({
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    });
    expect(mockedUserRepo.upsertAccessToken).toHaveBeenCalledWith(
      'user-123',
      accessToken.token,
      accessToken.expiresAt,
    );
    expect(mockedUserRepo.replaceRefreshToken).toHaveBeenCalledWith(
      'user-123',
      refreshToken.token,
      refreshToken.expiresAt,
    );
  });

  it('TC-Authen02: loginUser rejects incorrect credentials', async () => {
    mockedUserRepo.findUserbyEmail.mockResolvedValue({
      id: 'user-123',
      email: 'valid@whendee.app',
      password: 'hashed',
    } as any);
    mockedBcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.loginUser('valid@whendee.app', 'wrong-pass'),
    ).rejects.toMatchObject({
      message: 'Incorrect email or password',
      code: 'INCORRECT_CREDENTIALS',
    });
  });

  it('TC-Authen03: loginWithGoogle creates accounts and issues tokens for Google OAuth', async () => {
    mockedUserRepo.findUserbyEmail.mockResolvedValueOnce(null).mockResolvedValue({
      id: 'google-user',
      email: 'google@whendee.app',
    } as any);
    mockedUserRepo.createUser.mockResolvedValue({
      id: 'google-user',
    } as any);

    const tokens = await authService.loginWithGoogle({
      emails: [{ value: 'google@whendee.app' }],
      displayName: 'Google User',
      photos: [{ value: 'https://cdn/avatar.png' }],
    });

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'google@whendee.app',
        name: 'Google User',
      }),
    );
    expect(tokens.accessToken).toBe(accessToken.token);
    expect(mockedUserRepo.upsertAccessToken).toHaveBeenCalledWith(
      'google-user',
      accessToken.token,
      accessToken.expiresAt,
    );
  });

  it('TC-Authen04: loginWithLine provisions accounts and tokens when LINE OAuth succeeds', async () => {
    mockedUserRepo.findUserbyEmail.mockResolvedValueOnce(null).mockResolvedValue({
      id: 'line-user',
      email: 'line@whendee.app',
    } as any);
    mockedUserRepo.createUser.mockResolvedValue({
      id: 'line-user',
    } as any);

    const tokens = await authService.loginWithLine({
      emails: [{ value: 'line@whendee.app' }],
      displayName: 'Line User',
      provider: 'line',
    });

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'line@whendee.app',
        name: 'Line User',
      }),
    );
    expect(tokens.refreshToken).toBe(refreshToken.token);
    expect(mockedUserRepo.replaceRefreshToken).toHaveBeenCalledWith(
      'line-user',
      refreshToken.token,
      refreshToken.expiresAt,
    );
  });

  it('TC-Authen05: cancelling login (missing LINE email) surfaces a descriptive AppError', async () => {
    await expect(
      authService.loginWithLine({ emails: [], displayName: 'no-email' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});

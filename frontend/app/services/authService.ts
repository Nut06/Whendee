import * as Linking from 'expo-linking';
import type { QueryParams } from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { identityApi } from '@/utils/api';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
  AuthTokens,
} from '@/types/user.types';
import { SecureStorage } from './secureStorage';
import { debugAuth, timeSince } from '@/utils/debug';

const identityBaseUrl = identityApi.defaults.baseURL;

function extractStringParams(
  params: QueryParams | null | undefined,
): Partial<Record<string, string>> {
  if (!params) {
    return {};
  }

  return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string' && value.length) {
      acc[key] = value;
      return acc;
    }

    if (Array.isArray(value)) {
      const first = value.find((entry): entry is string => typeof entry === 'string' && entry.length > 0);
      if (first) {
        acc[key] = first;
      }
    }

    return acc;
  }, {});
}

function parseAuthSessionParams(callbackUrl: string): Partial<Record<string, string>> {
  const parsed = Linking.parse(callbackUrl);
  const parsedParams = extractStringParams(parsed.queryParams);

  if (Object.keys(parsedParams).length > 0) {
    return parsedParams;
  }

  const fragmentIndex = callbackUrl.indexOf('#');
  if (fragmentIndex === -1) {
    return {};
  }

  const fragment = callbackUrl.slice(fragmentIndex + 1);
  const fragmentQuery = fragment.startsWith('?') ? fragment.slice(1) : fragment;
  const searchParams = new URLSearchParams(fragmentQuery);
  const fallbackParams: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    if (value.length) {
      fallbackParams[key] = value;
    }
  });

  return fallbackParams;
}

// ==================== LOCAL LOGIN ====================
export const loginLocal = async (
  credentials: LoginRequest
): Promise<AuthTokens> => {
  try {
    debugAuth('loginLocal: start', { baseURL: identityBaseUrl });
    const res = await identityApi.post<LoginResponse>('/auth/login', credentials);
    const tokens = res.data.data;
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    debugAuth('loginLocal: success, tokens saved');
    return tokens;
  } catch (error: any) {
    debugAuth('loginLocal: error', error?.response?.status, error?.response?.data);
    throw new Error(
      error.response?.data?.message || 'Login failed. Please try again.'
    );
  }
};

// ==================== REFRESH TOKEN ====================
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  try {
    debugAuth('refreshAccessToken: start');
    const res = await identityApi.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    const tokens = res.data.data;
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    debugAuth('refreshAccessToken: success');
    return tokens;
  } catch (error: any) {
    debugAuth('refreshAccessToken: error', error?.response?.status, error?.response?.data);
    throw new Error(
      error.response?.data?.message || 'Session expired. Please login again.'
    );
  }
};

// ==================== GET CURRENT USER ====================
export const getUser = async (accessToken: string): Promise<User> => {
  try {
    const t0 = Date.now();
    debugAuth('getUser: start', { baseURL: identityBaseUrl });
    const response = await identityApi.get<{ success: boolean; data: { user: User } }>(
      '/auth/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.data.success) {
      debugAuth('getUser: API success=false', { took: timeSince(t0) });
      throw new Error('Failed to get user info');
    }

    debugAuth('getUser: success', { took: timeSince(t0) });
    return response.data.data.user;
  } catch (error: any) {
    debugAuth('getUser: error', error?.response?.status, error?.response?.data);
    throw new Error(
      error.response?.data?.message || 'Failed to get user information'
    );
  }
};

// ==================== LINE LOGIN (Placeholder) ====================
export const loginLine = async (): Promise<AuthTokens> => {
  try {
    // TODO: Implement LINE OAuth flow
    const response = await identityApi.post<LoginResponse>('/auth/line-login');
    const tokens = response.data.data;
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    return tokens;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'LINE login failed. Please try again.'
    );
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await SecureStorage.clearAccessToken();
    await SecureStorage.clearRefreshToken();
  }
  catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Logout failed. Please try again.'
    );
  }
};

// ==================== GOOGLE LOGIN (Placeholder) ====================
export const loginGoogle = async (): Promise<AuthTokens> => {
  try {
    if (!identityBaseUrl) {
      throw new Error('Identity service URL is not configured');
    }

    const redirectUri = Linking.createURL('/auth/callback');
    const authUrl = `${identityBaseUrl}/auth/google?redirectUri=${encodeURIComponent(redirectUri)}`;
    debugAuth('loginGoogle: start', { identityBaseUrl, redirectUri, authUrl });

    const t0 = Date.now();
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
      preferEphemeralSession: Platform.OS === 'ios',
    });

  const hasUrl = (result as any)?.url ? true : false;
  debugAuth('loginGoogle: result', { type: result.type, took: timeSince(t0), hasUrl });
    if (result.type !== 'success' || !result.url) {
      await WebBrowser.dismissBrowser();

      if (result.type === 'dismiss' || result.type === 'cancel') {
        debugAuth('loginGoogle: dismissed/cancelled');
        throw new Error('Google login cancelled by user');
      }

      throw new Error('Google login did not complete');
    }

    const params = parseAuthSessionParams(result.url);
    debugAuth('loginGoogle: parsed params keys', Object.keys(params));
    const isSuccess = params.success === 'true';
    const errorMessage = params.error;

    if (!isSuccess || errorMessage) {
      await WebBrowser.dismissBrowser();
      debugAuth('loginGoogle: auth failed', { errorMessage });
      throw new Error(errorMessage || 'Google login failed. Please try again.');
    }

    const accessToken = params.access;
    const refreshToken = params.refresh;

    if (!accessToken || !refreshToken) {
      await WebBrowser.dismissBrowser();
      debugAuth('loginGoogle: missing tokens', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
      throw new Error('Missing credentials from Google login response');
    }

    const accessTokenExpiresAt =
      typeof params.access_expires === 'string' && params.access_expires.length
        ? params.access_expires
        : null;
    const refreshTokenExpiresAt =
      typeof params.refresh_expires === 'string' && params.refresh_expires.length
        ? params.refresh_expires
        : null;

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };

    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    debugAuth('loginGoogle: tokens saved, returning');

    return tokens;
  } catch (error: any) {
    await WebBrowser.dismissBrowser();
    console.error('Google login failed', error);
    debugAuth('loginGoogle: error', error?.response?.status, error?.response?.data || error?.message);
    const message =
      typeof error?.response?.data?.message === 'string'
        ? error.response.data.message
        : error?.message || 'Google login failed. Please try again.';
    throw new Error(message);
  }
};

import { identityApi } from '@/utils/api';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
  AuthTokens,
} from '@/types/user.types';
import { SecureStorage } from './secureStorage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const identityBaseUrl = identityApi.defaults.baseURL?.replace(/\/$/, '') ?? '';

// ==================== LOCAL LOGIN ====================
export const loginLocal = async (
  credentials: LoginRequest
): Promise<AuthTokens> => {
  try {
    const res = await identityApi.post<LoginResponse>('/auth/login', credentials);
    const tokens = res.data.data;
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    return tokens;
  } catch (error: any) {
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
    const res = await identityApi.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    const tokens = res.data.data;
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    return tokens;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Session expired. Please login again.'
    );
  }
};

// ==================== GET CURRENT USER ====================
export const getUser = async (accessToken: string): Promise<User> => {
  try {
    const response = await identityApi.get<{ success: boolean; data: { user: User } }>(
      '/auth/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to get user info');
    }

    return response.data.data.user;
  } catch (error: any) {
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

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success' || !result.url) {
      throw new Error(
        result.type === 'dismiss'
          ? 'Google login cancelled by user'
          : 'Google login did not complete'
      );
    }

    const parsed = Linking.parse(result.url);
    const params = parsed.queryParams ?? {};
    const isSuccess = params.success === 'true';
    const errorMessage = typeof params.error === 'string' ? params.error : undefined;

    if (!isSuccess || errorMessage) {
      throw new Error(errorMessage || 'Google login failed. Please try again.');
    }

    const accessToken = typeof params.access === 'string' ? params.access : undefined;
    const refreshToken = typeof params.refresh === 'string' ? params.refresh : undefined;

    if (!accessToken || !refreshToken) {
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

    return tokens;
  } catch (error: any) {
    const message =
      typeof error?.response?.data?.message === 'string'
        ? error.response.data.message
        : error?.message || 'Google login failed. Please try again.';
    throw new Error(message);
  }
};

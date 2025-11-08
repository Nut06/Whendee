import { identityApi, ApiResponse } from '@/utils/api';
import { LoginRequest, LoginResponse, RefreshTokenResponse, User, AuthTokens } from '@/types/user.types';
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
export const getUser = async (accessToken?: string): Promise<User> => {
  try {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    const response = await identityApi.get<ApiResponse<{ user: User }>>( '/auth/me', { headers });

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
    if (!identityBaseUrl) {
      throw new Error('Identity service URL is not configured');
    }
    const redirectUri = Linking.createURL('/auth/callback');
    const authUrl = `${identityBaseUrl}/auth/line?redirectUri=${encodeURIComponent(redirectUri)}`;
    console.log('[LINE][Frontend] Initiating login', { identityBaseUrl, redirectUri, authUrl });
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    const resultUrl = (result.type === 'success' && 'url' in result) ? (result as any).url as string : undefined;
    console.log('[LINE][Frontend] WebBrowser result', { type: result.type, urlPresent: Boolean(resultUrl) });
    if (result.type !== 'success' || !resultUrl) {
      throw new Error(result.type === 'dismiss' ? 'LINE login cancelled' : 'LINE login did not complete');
    }
    const parsed = Linking.parse(resultUrl);
    const params = parsed.queryParams ?? {};
    console.log('[LINE][Frontend] Parsed redirect params', params);
    const isSuccess = params.success === 'true';
    const errorMessage = typeof params.error === 'string' ? params.error : undefined;
    if (!isSuccess || errorMessage) {
      console.log('[LINE][Frontend] Login failed', { errorMessage });
      throw new Error(errorMessage || 'LINE login failed. Please try again.');
    }
    const accessToken = typeof params.access === 'string' ? params.access : undefined;
    const refreshToken = typeof params.refresh === 'string' ? params.refresh : undefined;
    if (!accessToken || !refreshToken) {
      console.log('[LINE][Frontend] Missing tokens', { hasAccess: Boolean(accessToken), hasRefresh: Boolean(refreshToken) });
      throw new Error('Missing credentials from LINE login response');
    }
    const accessTokenExpiresAt = typeof params.access_expires === 'string' && params.access_expires.length ? params.access_expires : null;
    const refreshTokenExpiresAt = typeof params.refresh_expires === 'string' && params.refresh_expires.length ? params.refresh_expires : null;
    const tokens: AuthTokens = { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt };
    console.log('[LINE][Frontend] Storing tokens', {
      accessPreview: accessToken.slice(0, 12) + '...',
      refreshPreview: refreshToken.slice(0, 12) + '...',
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    });
    await SecureStorage.saveAccessToken(tokens.accessToken);
    await SecureStorage.saveRefreshToken(tokens.refreshToken);
    return tokens;
  } catch (error: any) {
    const message = typeof error?.response?.data?.message === 'string' ? error.response.data.message : error?.message || 'LINE login failed. Please try again.';
    console.log('[LINE][Frontend] loginLine error', { message });
    throw new Error(message);
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

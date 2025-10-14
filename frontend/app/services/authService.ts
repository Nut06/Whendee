import api from '../utils/api';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '@/types/user.types';
import { SecureStorage } from './secureStorage';

// ==================== LOCAL LOGIN ====================
export const loginLocal = async (
  credentials: LoginRequest
): Promise<void> => {
  try {
    const res = await api.post<LoginResponse>('/auth/login', credentials);
    const data = res.data;
    await SecureStorage.saveAccessToken(data.data.accessToken);
    await SecureStorage.saveRefreshToken(data.data.refreshToken);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Login failed. Please try again.'
    );
  }
};

// ==================== REFRESH TOKEN ====================
export const refreshAccessToken = async (
  refreshToken: string
): Promise<void> => {
  try {
    const res = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    const data = res.data;
    await SecureStorage.saveAccessToken(data.data.accessToken);
    await SecureStorage.saveRefreshToken(data.data.refreshToken);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Session expired. Please login again.'
    );
  }
};

// ==================== GET CURRENT USER ====================
export const getUser = async (accessToken: string): Promise<User> => {
  try {
    const response = await api.get<{ success: boolean; data: { user: User } }>(
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
export const loginLine = async (): Promise<void> => {
  try {
    // TODO: Implement LINE OAuth flow
    const response = await api.post<LoginResponse>('/auth/line-login');
    const data = response.data;
    await SecureStorage.saveAccessToken(data.data.accessToken);
    await SecureStorage.saveRefreshToken(data.data.refreshToken);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'LINE login failed. Please try again.'
    );
  }
};

// ==================== GOOGLE LOGIN (Placeholder) ====================
export const loginGoogle = async (): Promise<void> => {
  try {
    const response = await api.post<LoginResponse>('/auth/google-login');
    const data = response.data;
    await SecureStorage.saveAccessToken(data.data.accessToken);
    await SecureStorage.saveRefreshToken(data.data.refreshToken);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Google login failed. Please try again.'
    );
  }
};
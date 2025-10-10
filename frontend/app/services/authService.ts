import api from '../utils/api';
import {
  LoginRequest,
  LoginResponse,
  RequestOTP,
  ResponseOTP as ResponseOTP,
  VerifyOtp,
  VerifyOTPResponse,
  RefreshTokenResponse,
  User,
  ResponseOtp,
} from '@/types/user.types';

// ==================== LOCAL LOGIN ====================
export const loginLocal = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Login failed. Please try again.'
    );
  }
};

// ==================== REGISTER WITH OTP ====================
// Step 1: Request OTP for registration
export const requestOTP = async (
  payload: RequestOTP
): Promise<ResponseOTP> => {
  try {
    const response = await api.post<ResponseOTP>(
      '/auth/request-otp',
      payload
    );

    if (!response.data.success) {
      throw new Error("Failed to send OTP");
    }

    return response.data;
  } catch (error: any) {
    throw new Error("Failed to send OTP. Please try again.");
  }
};

// Step 2: Verify OTP and complete registration
export const verifyOTPAndRegister = async (
  payload: VerifyOtp
): Promise<VerifyOTPResponse> => {
  try {
    const response = await api.post<VerifyOTPResponse>(
      '/auth/verify-otp',
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'OTP verification failed');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'OTP verification failed. Please try again.'
    );
  }
};

// ==================== RESEND OTP ====================
export const resendOTP = async (sessionToken: string): Promise<ResponseOtp> => {
  try {
    const response = await api.post<ResponseOtp>('/auth/register/resend-otp', {
      sessionToken,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to resend OTP');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to resend OTP. Please try again.'
    );
  }
};

// ==================== LOGOUT ====================
export const logout = async (accessToken: string): Promise<void> => {
  try {
    await api.post(
      '/auth/logout',
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (error: any) {
    console.error('Logout API error:', error);
  }
};

// ==================== REFRESH TOKEN ====================
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string }> => {
  try {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    if (!response.data.success) {
      throw new Error('Token refresh failed');
    }

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Session expired. Please login again.'
    );
  }
};

// ==================== GET CURRENT USER ====================
export const getCurrentUser = async (accessToken: string): Promise<User> => {
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
export const loginLine = async (): Promise<LoginResponse> => {
  try {
    // TODO: Implement LINE OAuth flow
    const response = await api.post<LoginResponse>('/auth/line-login');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'LINE login failed. Please try again.'
    );
  }
};

// ==================== GOOGLE LOGIN (Placeholder) ====================
export const loginGoogle = async (): Promise<LoginResponse> => {
  try {
    // TODO: Implement Google OAuth flow
    const response = await api.post<LoginResponse>('/auth/google-login');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Google login failed. Please try again.'
    );
  }
};
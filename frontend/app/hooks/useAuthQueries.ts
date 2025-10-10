import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import * as authService from '@/services/authService';
import {
  LoginRequest,
  RequestOTP,
  VerifyOtp,
} from '@/types/user.types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// ==================== LOGIN LOCAL ====================
export const useLoginLocal = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      authService.loginLocal(credentials),
    onSuccess: async (response) => {
      await setAuth(response.user, response.token, response.refreshToken);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// ==================== REQUEST OTP FOR REGISTRATION ====================
export const useRequestOTP = () => {
  return useMutation({
    mutationFn: (payload: RequestOTP) =>
      authService.requestOTP(payload),
  });
};

// ==================== VERIFY OTP AND REGISTER ====================
export const useVerifyOTP = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyOtp) =>
      authService.verifyOTPAndRegister(payload),
    onSuccess: async (response) => {
      await setAuth(
        response.data.accessToken,
        response.data.refreshToken
      );
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// ==================== RESEND OTP ====================
export const useResendOTP = () => {
  return useMutation({
    mutationFn: (sessionToken: string) => authService.resendOTP(sessionToken),
  });
};

// ==================== LOGIN LINE ====================
export const useLoginLine = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.loginLine(),
    onSuccess: async (response) => {
      await setAuth(response.user, response.token, response.refreshToken);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// ==================== LOGIN GOOGLE ====================
export const useLoginGoogle = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.loginGoogle(),
    onSuccess: async (response) => {
      await setAuth(response.user, response.token, response.refreshToken);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// ==================== LOGOUT ====================
export const useLogout = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (accessToken) {
        await authService.logout(accessToken);
      }
    },
    onSettled: async () => {
      await clearAuth();
      queryClient.clear();
    },
  });
};

// ==================== REFRESH TOKEN ====================
export const useRefreshToken = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const updateTokens = useAuthStore((state) => state.updateTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authService.refreshAccessToken(refreshToken);
    },
    onSuccess: async (data) => {
      await updateTokens(data.accessToken, data.refreshToken);
    },
    onError: async () => {
      // If refresh fails, logout user
      await clearAuth();
    },
  });
};
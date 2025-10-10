import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  useLoginLocal,
  useLoginLine,
  useLoginGoogle,
  useLogout,
  useRefreshToken,
  useRequestOTP,
  useVerifyOTP,
  useResendOTP,
} from './useAuthQueries';

export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isInitialized,
    initializeAuth,
  } = useAuthStore();

  const loginLocalMutation = useLoginLocal();
  const loginLineMutation = useLoginLine();
  const loginGoogleMutation = useLoginGoogle();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();
  const requestOTPMutation = useRequestOTP();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  return {
    // ==================== STATE ====================
    user,
    accessToken,
    isAuthenticated,
    isLoading: !isInitialized,

    // ==================== LOGIN METHODS ====================
    loginLocal: loginLocalMutation.mutateAsync,
    loginLine: loginLineMutation.mutateAsync,
    loginGoogle: loginGoogleMutation.mutateAsync,

    // ==================== REGISTRATION WITH OTP ====================
    requestOTP: requestOTPMutation.mutateAsync,
    verifyOTP: verifyOTPMutation.mutateAsync,
    resendOTP: resendOTPMutation.mutateAsync,

    // ==================== LOGOUT ====================
    logout: logoutMutation.mutateAsync,

    // ==================== REFRESH TOKEN ====================
    refreshToken: refreshTokenMutation.mutateAsync,

    // ==================== LOADING STATES ====================
    isLoginLoading: loginLocalMutation.isPending,
    isLineLoginLoading: loginLineMutation.isPending,
    isGoogleLoginLoading: loginGoogleMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isRequestOTPLoading: requestOTPMutation.isPending,
    isVerifyOTPLoading: verifyOTPMutation.isPending,
    isResendOTPLoading: resendOTPMutation.isPending,

    // ==================== ERRORS ====================
    loginError: loginLocalMutation.error,
    lineLoginError: loginLineMutation.error,
    googleLoginError: loginGoogleMutation.error,
    requestOTPError: requestOTPMutation.error,
    verifyOTPError: verifyOTPMutation.error,
    resendOTPError: resendOTPMutation.error,

    // ==================== RESET ERRORS ====================
    resetLoginError: loginLocalMutation.reset,
    resetOTPError: requestOTPMutation.reset,
    resetVerifyError: verifyOTPMutation.reset,
  };
};
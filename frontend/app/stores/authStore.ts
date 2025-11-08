import { getUser, loginGoogle, loginLine, loginLocal } from '@/services/authService';
// TO DO ปรับปรุงให้เข้ากับ code
import { create } from 'zustand';
import { SecureStorage } from '@/services/secureStorage';
import { AuthTokens, User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  // Actions
  setUser: (key: keyof User, value: any) => void;
  setAuth: (tokens?: AuthTokens) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginLine: () => Promise<void>;
  loginWithCredentials: (payload: { email: string; password: string }) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  isAuthenticated: false,
  isInitialized: false,
  loginGoogle: async () => {
    try {
      const tokens = await loginGoogle();
      await get().setAuth(tokens);
    } catch (error) {
      throw error;
    }
  },
  loginLine: async () => {
    try {
      const tokens = await loginLine();
      await get().setAuth(tokens);
    } catch (error) {
      throw error;
    }
  },
  loginWithCredentials: async ({ email, password }) => {
    try {
      const tokens = await loginLocal({ email, password });
      await get().setAuth(tokens);
    } catch (error) {
      throw error;
    }
  },
  setUser: (key, val) => set((state) => ({ user:{...state.user, [key]: val} as User })),

  // ==================== SET AUTH ====================
  // บันทึก user และ tokens ทั้งหมด
  setAuth: async (tokens) => {
    try {
      const accessToken = tokens?.accessToken ?? await SecureStorage.getAccessToken();
      if(!accessToken){
        throw new Error("None of AccessToken");
      }
      const user = await getUser(accessToken);
      const refreshToken = tokens?.refreshToken ?? await SecureStorage.getRefreshToken();
      await SecureStorage.saveTempUserData(user);

      set({
        user,
        accessToken,
        refreshToken: refreshToken ?? null,
        accessTokenExpiresAt: tokens?.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: tokens?.refreshTokenExpiresAt ?? null,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error saving auth to SecureStore:', error);
      throw error;
    }
  },

  // ==================== CLEAR AUTH ====================
  // ลบทุกอย่างออกจาก SecureStore
  clearAuth: async () => {
    try {
      await SecureStorage.clearAll();
    } catch (error) {
      console.error('Error clearing auth from SecureStore:', error);
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  // ==================== UPDATE USER ====================
  // อัพเดท user profile เฉพาะ
  updateUser: async (user: User) => {
    try {
      await SecureStorage.saveTempUserData(user);
      set({ user });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // ==================== INITIALIZE AUTH ====================
  // โหลด auth state จาก SecureStore ตอนเปิด app
  initializeAuth: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStorage.getAccessToken(),
        SecureStorage.getRefreshToken(),
        SecureStorage.getTempUserData(),
      ]);

      if (accessToken && userJson) {
        const user: User = JSON.parse(userJson);
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));
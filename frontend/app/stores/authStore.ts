import { getUser, loginGoogle, loginLine, loginLocal } from './../services/authService';
import { debugAuth, timeSince } from '@/utils/debug';
// TO DO ปรับปรุงให้เข้ากับ code
import { create } from 'zustand';
import { SecureStorage } from '@/services/secureStorage';
import { AuthTokens, User } from '../types/user.types';

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
      debugAuth('store.loginGoogle: start');
      const tokens = await loginGoogle();
      debugAuth('store.loginGoogle: tokens received');
      await get().setAuth(tokens);
    } catch (error) {
      debugAuth('store.loginGoogle: error', (error as any)?.message);
      throw error;
    }
  },
  loginLine: async () => {
    try {
      debugAuth('store.loginLine: start');
      const tokens = await loginLine();
      debugAuth('store.loginLine: tokens received');
      await get().setAuth(tokens);
    } catch (error) {
      debugAuth('store.loginLine: error', (error as any)?.message);
      throw error;
    }
  },
  loginWithCredentials: async ({ email, password }) => {
    try {
      debugAuth('store.loginWithCredentials: start');
      const tokens = await loginLocal({ email, password });
      debugAuth('store.loginWithCredentials: tokens received');
      await get().setAuth(tokens);
    } catch (error) {
      debugAuth('store.loginWithCredentials: error', (error as any)?.message);
      throw error;
    }
  },
  setUser: (key, val) => set((state) => ({ user:{...state.user, [key]: val} as User })),

  // ==================== SET AUTH ====================
  // บันทึก user และ tokens ทั้งหมด
  setAuth: async (tokens) => {
    try {
      debugAuth('store.setAuth: start', { hasTokens: !!tokens });
      if (tokens?.accessToken) {
        await SecureStorage.saveAccessToken(tokens.accessToken);
        debugAuth('store.setAuth: access token saved');
      }

      if (tokens?.refreshToken) {
        await SecureStorage.saveRefreshToken(tokens.refreshToken);
        debugAuth('store.setAuth: refresh token saved');
      }

      const accessToken =
        tokens?.accessToken ?? (await SecureStorage.getAccessToken());
      if (!accessToken) {
        throw new Error("None of AccessToken");
      }

      const refreshToken =
        tokens?.refreshToken ?? (await SecureStorage.getRefreshToken());

      let cachedUser = get().user;
      if (!cachedUser) {
        const storedUser = await SecureStorage.getTempUserData();
        cachedUser = storedUser ?? null;
      }

      set({
        user: cachedUser ?? null,
        accessToken,
        refreshToken: refreshToken ?? null,
        accessTokenExpiresAt: tokens?.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: tokens?.refreshTokenExpiresAt ?? null,
        isAuthenticated: true,
        isInitialized: true,
      });

      debugAuth('store.setAuth: state set (cached user?)', { hasCachedUser: !!cachedUser });

      const hydrateUser = async () => {
        try {
          const t0 = Date.now();
          const freshUser = await getUser(accessToken);
          if (freshUser) {
            await SecureStorage.saveTempUserData(freshUser);
            set({ user: freshUser });
            debugAuth('store.setAuth: hydrated user from /auth/me', { took: timeSince(t0) });
          }
        } catch (err) {
          console.warn('Failed to hydrate user profile after auth', err);
          debugAuth('store.setAuth: hydrate user failed', (err as any)?.message);
        }
      };

      void hydrateUser();
    } catch (error) {
      console.error('Error saving auth to SecureStore:', error);
      debugAuth('store.setAuth: error', (error as any)?.message);
      throw error;
    }
  },

  // ==================== CLEAR AUTH ====================
  // ลบทุกอย่างออกจาก SecureStore
  clearAuth: async () => {
    try {
      debugAuth('store.clearAuth: start');
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
    debugAuth('store.clearAuth: completed');
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
      debugAuth('store.initializeAuth: start');
      const [accessToken, refreshToken, cachedUser] = await Promise.all([
        SecureStorage.getAccessToken(),
        SecureStorage.getRefreshToken(),
        SecureStorage.getTempUserData(),
      ]);

      if (accessToken && cachedUser) {
        const user: User = cachedUser;
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          isAuthenticated: true,
          isInitialized: true,
        });
        debugAuth('store.initializeAuth: restored session with cached user');
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
        debugAuth('store.initializeAuth: no session/token or no cached user');
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
      debugAuth('store.initializeAuth: failed', (error as any)?.message);
    }
  },
}));

import { getUser, loginGoogle, loginLine } from './../services/authService';
// TO DO ปรับปรุงให้เข้ากับ code
import { create } from 'zustand';
import { SecureStorage } from '@/services/secureStorage';
import { User } from '../types/user.types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  // Actions
  setUser: (key: keyof User, value: any) => void;
  setAuth: () => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginLine: () => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
  loginGoogle: async () => {
    try {
      await loginGoogle();
      await get().setAuth();
    } catch (error) {
      throw error;
    }
  },
  loginLine: async () => {
    try {
      await loginLine();
      await get().setAuth();
    } catch (error) {
      throw error;
    }
  },
  setUser: (key, val) => set((state) => ({ user:{...state.user, [key]: val} as User })),

  // ==================== SET AUTH ====================
  // บันทึก user และ tokens ทั้งหมด
  setAuth: async () => {
    try {
          const accessToken = await SecureStorage.getAccessToken();
          if(!accessToken){
            throw new Error("None of AccessToken");
          }
          const user = await getUser(accessToken);

          set({
            user,
            accessToken,
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
      // ยังคง clear state แม้จะเกิด error
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
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
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
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
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));
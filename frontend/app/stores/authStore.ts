// TO DO ปรับปรุงให้เข้ากับ code
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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
  setAuth: (
    accessToken: string,
    refreshToken?: string
  ) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  // ==================== SET AUTH ====================
  // บันทึก user และ tokens ทั้งหมด
  setAuth: async (user: User | null, accessToken: string, refreshToken?: string) => {
    try {
          const savePromises = [
            SecureStore.setItemAsync(TOKEN_KEY, accessToken),
          ];

          if (refreshToken) {
            savePromises.push(
              SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
            );
          }

          await Promise.all(savePromises);

          set({
            user,
            accessToken,
            refreshToken: refreshToken || null,
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
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
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

  // ==================== UPDATE TOKENS ====================
  // อัพเดท tokens เฉพาะ (สำหรับ refresh token)
  updateTokens: async (accessToken: string, refreshToken?: string) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user to update tokens for');
    }

    try {
      const updatePromises = [SecureStore.setItemAsync(TOKEN_KEY, accessToken)];

      if (refreshToken) {
        updatePromises.push(
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
        );
      }

      await Promise.all(updatePromises);

      set({
        accessToken,
        ...(refreshToken && { refreshToken }),
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  // ==================== UPDATE USER ====================
  // อัพเดท user profile เฉพาะ
  updateUser: async (user: User) => {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
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
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
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
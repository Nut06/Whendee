// =============================================
// ตัวอย่างการใช้งาน API Service
// =============================================

import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/user.types';
import api, { ApiResponse, getErrorMessage, isNetworkError } from '../utils/api';

// =============================================
// Types สำหรับ API responses
// =============================================



// =============================================
// Auth Service
// =============================================

export const authService = {
  /**
   * Login ด้วย email และ password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        credentials
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register บัญชีใหม่
   */
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        '/auth/register',
        userData
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ verified: boolean }>>(
        '/auth/verify-otp',
        { email, otp }
      );
      return response.data.data.verified;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Request OTP
   */
  requestOTP: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/request-otp', { email });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      // ลบ token จาก AsyncStorage
      // await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// =============================================
// User Service
// =============================================

export const userService = {
  /**
   * อัปเดตโปรไฟล์
   */
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>(
        `/users/${userId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * ดึงรายการเพื่อน
   */
  getFriends: async (): Promise<User[]> => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users/friends');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * เพิ่มเพื่อน
   */
  addFriend: async (userId: string): Promise<void> => {
    try {
      await api.post(`/users/friends/${userId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// =============================================
// ตัวอย่างการใช้งานใน Component
// =============================================

/*
import { useState } from 'react';
import { authService } from './apiExamples';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.login({ email, password });
      
      // เก็บ token
      // await AsyncStorage.setItem('auth_token', response.token);
      
      console.log('Login success:', response.user);
      // Navigate to home screen
      
    } catch (err) {
      if (isNetworkError(err)) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } else {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX...
  );
}
*/

// =============================================
// Upload File (สำหรับ multipart/form-data)
// =============================================

export const uploadService = {
  /**
   * Upload รูปภาพ
   */
  uploadImage: async (uri: string, fieldName: string = 'file'): Promise<string> => {
    try {
      const formData = new FormData();
      
      // สำหรับ React Native
      formData.append(fieldName, {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await api.post<ApiResponse<{ url: string }>>(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data.url;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// =============================================
// Export all services
// =============================================

export default {
  auth: authService,
  user: userService,
  upload: uploadService,
};

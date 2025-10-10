import axios, { AxiosError, AxiosResponse, isAxiosError } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ติดตั้งถ้ายังไม่มี

// =============================================
// API Configuration
// =============================================

// กำหนด Base URL ตาม environment

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.IDENTITY_SERVICE_PORT || 3002}`; // เปลี่ยนเป็น URL ของ API server

// =============================================
// Create Axios Instance
// =============================================

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// =============================================
// Request Interceptor (สำหรับแนบ token)
// =============================================

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request (development only)
      if (__DEV__) {
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (สำหรับจัดการ error)
// =============================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response (development only)
    if (__DEV__) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // จัดการ error ตาม status code
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token หมดอายุ
          await AsyncStorage.removeItem('access_token');
          // ให้ redirect ไป login (ใช้ navigation service)

          console.log('🔒 Unauthorized - Token expired');
          break;

        case 403:
          // Forbidden
          console.log('🚫 Forbidden - No permission');
          break;

        case 404:
          // Not Found
          console.log('🔍 Not Found');
          break;

        case 500:
        case 502:
        case 503:
          // Server Error
          console.log('🔥 Server Error');
          break;

        default:
          console.log(`⚠️ Error ${status}`);
      }
    } else if (error.request) {
      // Request ส่งไปแล้วแต่ไม่ได้รับ response
      console.log('📡 Network Error - No response from server');
    } else {
      // Error อื่นๆ
      console.log('❓ Unknown Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// =============================================
// Helper Functions
// =============================================

/**
 * ดึง error message จาก API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiError;
    return data?.message || error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

/**
 * ตรวจสอบว่าเป็น network error หรือไม่
 */
export const isNetworkError = (error: unknown): boolean => {
  return isAxiosError(error) && !error.response;
};

// =============================================
// Export default
// =============================================

export default api;

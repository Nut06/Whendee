import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { Platform } from 'react-native';
import { SecureStorage } from '@/services/secureStorage';

// =============================================
// API Configuration
// =============================================

// กำหนด Base URL ตาม environment
const SERVICE_BASES = {
  identity: process.env.IDENTITY_SERVICE_URL || `http://localhost:${process.env.IDENTITY_SERVICE_PORT || 3002}`,
  communication: process.env.COMMUNICATION_SERVICE_URL || `http://localhost:${process.env.COMMUNICATION_SERVICE_PORT || 3003}`,
  event: process.env.EVENT_SERVICE_URL || `http://localhost:${process.env.EVENT_SERVICE_PORT || 3004}`,
}


// =============================================
// Create Axios Instance
// =============================================

const createApi = (baseUrl:string) => {
  const instance = axios.create({
  baseURL: baseUrl,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
  return instance;
}

export const identityApi = createApi(SERVICE_BASES.identity);
export const communicationApi = createApi(SERVICE_BASES.communication);
export const eventApi = createApi(SERVICE_BASES.event);

// =============================================
// Request Interceptor (สำหรับแนบ token)
// =============================================
const apiEndpoints: AxiosInstance[] = [identityApi, communicationApi, eventApi];

const withAccessToken = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  const token = await SecureStorage.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
};

const handleUnauthorized = async (error: AxiosError) => {
  if (error.response?.status === 401) {
    await SecureStorage.clearAccessToken();
  }
  return Promise.reject(error);
};

const applyInterceptors = (client: typeof identityApi) => {
  client.interceptors.request.use(withAccessToken);
  client.interceptors.response.use(undefined, handleUnauthorized);
};

apiEndpoints.forEach(applyInterceptors);

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

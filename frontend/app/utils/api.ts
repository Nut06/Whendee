import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SecureStorage } from '@/services/secureStorage';
import { debugAuth } from '@/utils/debug';

// =============================================
// API Configuration
// =============================================

// กำหนด Base URL ตาม environment
// NOTE: ตัวแปรฝั่ง Expo จะถูกอินไลน์เฉพาะคีย์ที่ขึ้นต้นด้วย EXPO_PUBLIC_
// เพื่อความยืดหยุ่น เราจะลองอ่านได้หลายคีย์ และค่อย fallback เป็น localhost
const resolveDevHost = (port: number | string) => {
  const explicit = process.env.EXPO_PUBLIC_DEV_HOST ?? process.env.EXPO_DEV_HOST;
  if (explicit) {
    return `http://${explicit}:${port}`;
  }

  const hostFromExpo =
    Constants.expoConfig?.hostUri ??
    Constants.expoConfig?.extra?.expoGo?.developer?.host ??
    (typeof Constants.manifest2 === 'object'
      ? (Constants.manifest2.extra as Record<string, any> | undefined)?.expoGo?.developer?.host
      : undefined);

  if (hostFromExpo) {
    const host = hostFromExpo.split(':')[0];
    if (host && host !== 'localhost') {
      return `http://${host}:${port}`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  if (Platform.OS === 'ios') {
    return `http://127.0.0.1:${port}`;
  }

  return `http://localhost:${port}`;
};

const buildBaseUrl = (envValue: string | undefined, fallbackPort: number): string => {
  if (envValue && envValue.trim().length > 0) {
    return envValue;
  }
  return resolveDevHost(fallbackPort);
};

const SERVICE_BASES = {
  identity: buildBaseUrl(
    process.env.EXPO_PUBLIC_IDENTITY_SERVICE_URL ||
      process.env.EXPO_PUBLIC_IDENTITY_API_URL ||
      process.env.IDENTITY_SERVICE_URL,
    Number(process.env.IDENTITY_SERVICE_PORT || 3002)
  ),
  communication:
    buildBaseUrl(
      process.env.EXPO_PUBLIC_COMMUNICATION_SERVICE_URL ||
        process.env.EXPO_PUBLIC_COMM_API_URL ||
        process.env.COMMUNICATION_SERVICE_URL ||
        process.env.COMM_SERVICE_URL,
      Number(process.env.COMMUNICATION_SERVICE_PORT || 3003)
    ),
  event:
    buildBaseUrl(
      process.env.EXPO_PUBLIC_EVENT_SERVICE_URL ||
        process.env.EXPO_PUBLIC_EVENT_API_URL ||
        process.env.EVENT_SERVICE_URL,
      Number(process.env.EVENT_SERVICE_PORT || 3004)
    ),
};


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
debugAuth('API base URLs', SERVICE_BASES);

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

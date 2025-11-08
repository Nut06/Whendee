import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ensure dependency installed
import { SecureStorage } from '@/services/secureStorage';

// =============================================
// API Configuration
// =============================================

// กำหนด Base URL ตาม environment (prefer EXPO_PUBLIC_* which Expo exposes to the client)
const pickEnv = (...keys: string[]) => {
  for (const k of keys) {
    const val = (process.env as any)?.[k];
    if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  }
  return undefined;
};

const normalizeBase = (url: string) => url.replace(/\/$/, '');

const identityUrl =
  pickEnv('EXPO_PUBLIC_IDENTITY_SERVICE_URL', 'IDENTITY_SERVICE_URL') ||
  `http://localhost:${pickEnv('EXPO_PUBLIC_IDENTITY_SERVICE_PORT', 'IDENTITY_SERVICE_PORT') || 3002}`;

const communicationUrl =
  pickEnv('EXPO_PUBLIC_COMMUNICATION_SERVICE_URL', 'COMMUNICATION_SERVICE_URL') ||
  `http://localhost:${pickEnv('EXPO_PUBLIC_COMMUNICATION_SERVICE_PORT', 'COMMUNICATION_SERVICE_PORT') || 3003}`;

const eventUrl =
  // Support both *_SERVICE_URL and legacy *_API_URL names
  pickEnv('EXPO_PUBLIC_EVENT_SERVICE_URL', 'EXPO_PUBLIC_EVENT_API_URL', 'EVENT_SERVICE_URL') ||
  `http://localhost:${pickEnv('EXPO_PUBLIC_EVENT_SERVICE_PORT', 'EVENT_SERVICE_PORT') || 3004}`;

const SERVICE_BASES = {
  identity: normalizeBase(identityUrl),
  communication: normalizeBase(communicationUrl),
  event: normalizeBase(eventUrl),
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

// =============================================
// Request Interceptor (สำหรับแนบ token)
// =============================================
const apiEndpoints: AxiosInstance[] = [identityApi, communicationApi, eventApi];

// =============================
// Dev Auth Override (send userId)
// =============================
const devOverrideEnabled = (): boolean => {
  const val = process.env.EXPO_PUBLIC_DEV_AUTH_OVERRIDE ?? '';
  return typeof val === 'string' && /^(1|true|yes)$/i.test(val.trim());
};

const withDevAuthOverride = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  try {
    if (!devOverrideEnabled()) return config;
    const userId = (process.env.EXPO_PUBLIC_DEV_USER_ID || '').trim();
    if (!userId) return config;

    // Always attach x-user-id header when override enabled
    const headers = AxiosHeaders.from(config.headers || {});
    if (!headers.has('x-user-id')) {
      headers.set('x-user-id', userId);
    }

    // Optionally inject userId into request body for write operations if not already present
    const method = (config.method || 'get').toLowerCase();
    const canMutateBody = method === 'post' || method === 'put' || method === 'patch';
    if (canMutateBody) {
      const data: any = (config as any).data;
      const hasFormData = typeof (global as any).FormData !== 'undefined' && data instanceof (global as any).FormData;
      if (!hasFormData) {
        if (data == null) {
          (config as any).data = { userId };
        } else if (typeof data === 'string') {
          try {
            const obj = JSON.parse(data);
            if (obj.userId == null && obj.id == null) {
              obj.userId = userId;
            }
            (config as any).data = JSON.stringify(obj);
            headers.set('Content-Type', 'application/json');
          } catch {
            // leave string body as-is
          }
        } else if (typeof data === 'object') {
          if (data.userId == null && data.id == null) {
            data.userId = userId;
          }
          (config as any).data = data;
        }
      }
    }

    config.headers = headers;
    return config;
  } catch {
    return config;
  }
};

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
    // Clear stored token (SecureStorage) fallback remove AsyncStorage legacy key if exists
    await SecureStorage.clearAccessToken();
    await AsyncStorage.removeItem('access_token').catch(() => {});
  }
  return Promise.reject(error);
};

const applyInterceptors = (client: typeof identityApi) => {
  // Add dev override first so headers/body are present even if no token
  client.interceptors.request.use(withDevAuthOverride);
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

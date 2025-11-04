// ใช้ types ที่คุณมีอยู่แล้ว + เพิ่มเติมสำหรับ Zustand/React Query

export interface PreferenceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string | null;
}

export interface UserPreference {
  id: string;
  score: number;
  category: PreferenceCategory;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreference[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse{
    success: boolean;
    message: string;
    data:{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string | null;
    refreshTokenExpiresAt: string | null;
    };
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtpRespone {
  success: true,
  message: "OTP verified successfully",
  data: {
    user: User,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresAt: string | null,
    refreshTokenExpiresAt: string | null,
  }
}

export interface ResponseOtp {
  success: boolean;
  expiresIn: number;
  message: string;
}


export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string | null;
    refreshTokenExpiresAt: string | null;
  };
}

// เพิ่ม types สำหรับ Zustand store
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// เพิ่ม types สำหรับ OTP flow
export interface RequestOTP {
  phone: string;
  email: string;
  password: string;
  fullname?: string;
}

export interface ResponseOTP{
    success: boolean;
    message: string;
    data:{
        sessionToken:string;
        expiresIn:number;
    };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string | null;
    refreshTokenExpiresAt: string | null;
  };
}

// ใช้ types ที่คุณมีอยู่แล้ว + เพิ่มเติมสำหรับ Zustand/React Query

export interface User {
  id?: string;
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtp {
  sessionToken: string;
  otp: string;
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
    refreshToken?: string;
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
  };
}
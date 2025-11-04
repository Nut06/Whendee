export type User = {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
    preferences?: UserPreference[];
};

export type PreferenceCategory = {
    id: string;
    key: string;
    label: string;
    icon?: string | null;
};

export type UserPreference = {
    id: string;
    score: number;
    category: PreferenceCategory;
};

export type OTPRequest = {
    name?: string;
    fullname?: string;
    email: string;
    phone: string;
    password?: string;
}

export interface OTPverify {
    phone:string;
    otp:string
}

export interface OTPresend{
    phone:string;
}

export interface OTPSession{
    sessionToken: string;
    phone: string;
    otp: string;
    createdAt: string;
    expiresAt: string;
    attempts: number;
    ipAddress:string;
    userAgent:string;
}

export interface OTPResponse{
    success: boolean;
    message: string;
    data:{
        sessionToken:string;
        expiresIn:number;
    };
}

export interface LoginResponse{
    success: boolean;
    message: string;
    data:{
        accessToken:string;
        refreshToken:string;
                accessTokenExpiresAt: Date | null;
                refreshTokenExpiresAt: Date | null;
    };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
        accessTokenExpiresAt: Date | null;
        refreshTokenExpiresAt: Date | null;
  };
}

export type AuthToken = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
}

export type Otp = {
    phone:string;
    otp:string;
}

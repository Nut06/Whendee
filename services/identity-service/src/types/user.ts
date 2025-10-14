import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

export type User = {
    id: string;
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OTPRequest = {
    fullname: string;
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
        expiresIn:number;
    };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export type AuthToken = {
    accessToken: string;
    refreshToken: string;
}

export type Otp = {
    phone:string;
    otp:string;
}

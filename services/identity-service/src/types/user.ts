import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

export type User = {
    id: string;
    fullname?: string;
    email?: string;
}

export type RequestOTP = {
    fullname:string;
    email: string;
    phone:string;
    password?: string;
}

export interface verifyOTP {
    phone:string;
    otp:string
}

export interface resendOTP{
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

export interface ResponseOTP{
    success: boolean;
    message: string;
    data:{
        sessionToken:string;
        expiresIn:number;
    };
}

export interface ResponseLogin{
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

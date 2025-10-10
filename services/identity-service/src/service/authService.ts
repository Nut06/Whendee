import Bcrypt from "@/utils/bcrypt"
import { OTPSession, RequestOTP, User } from "@/types/user"
import UserRepo from "@/repo/userRepo";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/types/http";
import { createAccessToken } from "@/utils/jwt";
import { createRefreshToken } from '@/utils/jwt';
import { sendOTPSMS } from "@/utils/twilio";
import { redisClient, setAsync } from "@/utils/redis";
import { v4 as uuid } from 'uuid';
import express from 'express';

const otpKeyGen = (session: string) => `otp:${session}`;
const pendingKeyGen = (phone: string) => `pending_user:${phone}`;
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpExpiry = 5 * 60; // 5 minutes in seconds
const pendingUserExpiry = 5 * 60; // 5 minutes in seconds

const authService = {
    sendingOtp: async ({phone, ip, userAgent}: {phone: string, ip: string, userAgent: string}): Promise<string> => {
        try {
            const sessionToken = uuid();
            const otp = genOTP();
            const now = Date.now();
            const expiresAt = now + otpExpiry * 1000;
            const session:OTPSession = {
                sessionToken,
                phone,
                otp,
                attempts: 0,
                createdAt: now.toString(),
                expiresAt: expiresAt.toString(),
                ipAddress: ip,
                userAgent
            }
            const key = otpKeyGen(sessionToken);
            await redisClient.setEx(key, otpExpiry, JSON.stringify(session));
            await sendOTPSMS(otp, phone);
            return sessionToken;
        } catch (error) {
            throw new AppError('User registration failed', INTERNAL_SERVER_ERROR, 'USER_REGISTRATION_FAILED');
        }
    },
    getPendingUser: async (phone: string): Promise<RequestOTP> => {
        const key = pendingKeyGen(phone);
        let user = await redisClient.get(key);
        if (!user) {
            throw new AppError('No pending user found', BAD_REQUEST, 'NO_PENDING_USER');
        }
        user = JSON.parse(user);
        return user as unknown as RequestOTP;
    },

    storePendingUser: async (user: RequestOTP): Promise<void> => {
        const key = pendingKeyGen(user.phone);
        const data = JSON.stringify(user);
        try {
            await redisClient.setEx(key, pendingUserExpiry, data);
        } catch (err) {
            throw new AppError('Storing pending user failed', INTERNAL_SERVER_ERROR, 'PENDING_USER_FAILED');
        }
    },
    verifyOtp: async (session: string, otp: string): Promise<boolean> => {
        const key = otpKeyGen(session);
        let otpData = await redisClient.get(key);
        if (!otpData) {
            return false;
        }
        const parsedData: OTPSession = JSON.parse(otpData);
        if (parsedData.otp !== otp) {
            return false;
        }
        await redisClient.del(key);
        return true;
    },
    createUser: async (user: RequestOTP): Promise<{newUser:User, accessToken:string, refreshToken:string}> => {
        const {email} = user;
        const existingUser = await UserRepo.findUserbyEmail(email);
        if(existingUser){
            throw new AppError('User already exists', BAD_REQUEST, 'USER_ALREADY_EXISTS');
        }

        let newUser;
        const hashedPassword = await Bcrypt.hash(user.password || '');
        newUser = await UserRepo.createUser({
            ...user,
            password: hashedPassword
        }) as User;
        if (!newUser) {
            throw new AppError('User creation failed', INTERNAL_SERVER_ERROR, 'USER_CREATION_FAILED');
        }

        const accessToken = createAccessToken({ id: newUser.id });
        const refreshToken = createRefreshToken({ id: newUser.id });
        return { newUser, accessToken, refreshToken };
    },

    registerUser: async (user: RequestOTP): Promise<void> => {
        try{
            const existingUser = await UserRepo.findUserbyEmail(user.email);
            if(existingUser){
                throw new AppError('User already exists', BAD_REQUEST, 'USER_ALREADY_EXISTS');
            }
            await authService.createUser(user);
        }
        catch(error){
            throw new AppError('User registration failed', INTERNAL_SERVER_ERROR, 'USER_REGISTRATION_FAILED');
        }
    },
    
    loginUser: async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> => {
        const user = await UserRepo.findUserbyEmail(email);
        if (!user) {
            throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
        }
        
        const isPasswordValid = await Bcrypt.compare(password, user.password || '');
        if (!isPasswordValid) {
            throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
        }
        
        const accessToken: string = createAccessToken({ id: user.id });
        const refreshToken: string = createRefreshToken({ id: user.id });
        return { accessToken, refreshToken };
    },

    resendOtp: async({phone, session, ip, userAgent}
        :{phone:string, session:string, ip:string, userAgent:string}):Promise<string> => {
        const key = otpKeyGen(session);
        const existingSession = await redisClient.get(key);
        if (!existingSession) {
            throw new AppError('OTP session not found or expired', BAD_REQUEST, 'OTP_SESSION_NOT_FOUND');
        }
        await redisClient.del(key);
        const token = await authService.sendingOtp({phone, ip, userAgent});
        return token;
    },
};
export default authService;
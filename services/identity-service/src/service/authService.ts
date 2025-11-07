import Bcrypt from "@/utils/bcrypt";
import { OTPSession, OTPRequest, User, AuthToken } from "@/types/user";
import UserRepo from "@/repo/userRepo";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "@/types/http";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";
import { sendOTPSMS } from "@/utils/twilio";
import { redisClient } from "@/utils/redis";
import crypto from "crypto";

const otpKeyGen = (session: string) => `otp:${session}`;
const pendingKeyGen = (phone: string) => `pending_user:${phone}`;
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpExpiry = 5 * 60; // 5 minutes in seconds
const pendingUserExpiry = 5 * 60; // 5 minutes in seconds

const sanitizeUser = (user: User): User => {
    const { password, ...rest } = user;
    return { ...rest } as User;
};

const buildSessionForUser = async (userId: string): Promise<AuthToken> => {
    const access = generateAccessToken({ id: userId });
    const refresh = generateRefreshToken({ id: userId });

    await UserRepo.upsertAccessToken(userId, access.token, access.expiresAt ?? null);
    await UserRepo.replaceRefreshToken(userId, refresh.token, refresh.expiresAt ?? null);

    return {
        accessToken: access.token,
        refreshToken: refresh.token,
        accessTokenExpiresAt: access.expiresAt ?? null,
        refreshTokenExpiresAt: refresh.expiresAt ?? null,
    };
};

const authService = {
    sendingOtp: async ({phone, ip, userAgent}: {phone: string, ip: string, userAgent: string}): Promise<string> => {
        try {
            const sessionToken = crypto.randomUUID();
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
    
    getPendingUser: async (phone: string): Promise<OTPRequest> => {
        const key = pendingKeyGen(phone);
        let user = await redisClient.get(key);
        if (!user) {
            throw new AppError('No pending user found', BAD_REQUEST, 'NO_PENDING_USER');
        }
        user = JSON.parse(user);
        return user as unknown as OTPRequest;
    },

    storePendingUser: async (user: OTPRequest): Promise<void> => {
        const key = pendingKeyGen(user.phone);
        const data = JSON.stringify(user);
        try {
            await redisClient.setEx(key, pendingUserExpiry, data);
        } catch (err) {
            throw new AppError('Storing pending user failed', INTERNAL_SERVER_ERROR, 'PENDING_USER_FAILED');
        }
    },

    verifyOtp: async (session: string, otp: string): Promise<OTPSession | null> => {
        const key = otpKeyGen(session);
        let otpData = await redisClient.get(key);
        if (!otpData) {
            return null;
        }
        const parsedData: OTPSession = JSON.parse(otpData);
        if (parsedData.otp !== otp) {
            return null;
        }
        await redisClient.del(key);
        return parsedData;
    },

    createUser: async (user: OTPRequest): Promise<{ user: User; tokens: AuthToken }> => {
        const { email } = user;
        const existingUser = await UserRepo.findUserbyEmail(email);
        if(existingUser){
            throw new AppError('User already exists', BAD_REQUEST, 'USER_ALREADY_EXISTS');
        }

        const hashedPassword = user.password ? await Bcrypt.hash(user.password) : undefined;
        const createdUser = await UserRepo.createUser({
            name: user.name ?? user.fullname ?? undefined,
            email,
            phoneNumber: user.phone,
            password: hashedPassword ?? null,
        });

        if (!createdUser) {
            throw new AppError('User creation failed', INTERNAL_SERVER_ERROR, 'USER_CREATION_FAILED');
        }

        const tokens = await buildSessionForUser(createdUser.id);
        return { user: sanitizeUser(createdUser), tokens };
    },

    registerUser: async (user: OTPRequest): Promise<void> => {
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
    
    loginUser: async (email: string, password?: string): Promise<AuthToken> => {
        const user = await UserRepo.findUserbyEmail(email);
        if (!user) {
            throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
        }

        if(password){
            if (!user.password) {
                throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
            }
            const isPasswordValid = await Bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
            }
        }

        return buildSessionForUser(user.id);
    },

    loginWithGoogle: async (profile: any): Promise<AuthToken> => {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
            throw new AppError('Email not provided by Google', BAD_REQUEST, 'GOOGLE_LOGIN_FAILED');
        }

        const displayName = profile.displayName || profile?.name?.givenName || profile?.name?.familyName || undefined;
        const avatarUrl = profile?.photos?.[0]?.value || undefined;

        let user = await UserRepo.findUserbyEmail(email);

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await UserRepo.createUser({
                email,
                name: displayName,
                password: await Bcrypt.hash(randomPassword),
                avatarUrl,
            });
        } else {
            await UserRepo.updateUser(user.id, {
                name: user.name ?? displayName ?? null,
                avatarUrl: avatarUrl ?? user.avatarUrl ?? null,
            });
        }

        if (!user) {
            throw new AppError('Google login failed', INTERNAL_SERVER_ERROR, 'GOOGLE_LOGIN_FAILED');
        }

        return buildSessionForUser(user.id);
    },

    loginWithLine: async (profile: any): Promise<AuthToken> => {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
            throw new AppError('Email not provided by LINE', BAD_REQUEST, 'LINE_LOGIN_FAILED');
        }

        const displayName = profile.displayName || undefined;
        let user = await UserRepo.findUserbyEmail(email);

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await UserRepo.createUser({
                email,
                name: displayName,
                password: await Bcrypt.hash(randomPassword),
            });
        }

        if (!user) {
            throw new AppError('LINE login failed', INTERNAL_SERVER_ERROR, 'LINE_LOGIN_FAILED');
        }

        return buildSessionForUser(user.id);
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
    
    refreshToken: async (refreshToken: string): Promise<AuthToken> => {
        if (!refreshToken) {
            throw new AppError('Refresh token is required', BAD_REQUEST, 'REFRESH_TOKEN_REQUIRED');
        }

        let payload: { id: string };
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new AppError('Invalid refresh token', UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
        }

        const storedToken = await UserRepo.findRefreshToken(refreshToken);
        if (!storedToken) {
            throw new AppError('Refresh token not found', UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
        }

        if (storedToken.expiresAt && storedToken.expiresAt.getTime() < Date.now()) {
            await UserRepo.deleteRefreshToken(refreshToken);
            throw new AppError('Refresh token expired', UNAUTHORIZED, 'REFRESH_TOKEN_EXPIRED');
        }

        if (storedToken.userId !== payload.id) {
            throw new AppError('Refresh token mismatch', UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
        }

        return buildSessionForUser(storedToken.userId);
    },

    getUserFromToken: async (accessToken: string): Promise<User> => {
        let payload: { id: string };
        try {
            payload = verifyAccessToken(accessToken);
        } catch (error) {
            throw new AppError('Invalid access token', UNAUTHORIZED, 'INVALID_ACCESS_TOKEN');
        }

        const user = await UserRepo.findUserById(payload.id);
        if (!user) {
            throw new AppError('User not found', NOT_FOUND, 'USER_NOT_FOUND');
        }

        return sanitizeUser(user);
    }
};
export default authService;

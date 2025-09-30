import Bcrypt from "@/utils/bcrypt"
import { UserAuthInput } from "@/types/user"
import UserRepo from "@/repo/userRepo";
import { AppError } from "@/types/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/types/http";
import { createAccessToken } from "@/utils/jwt";
import { createRefreshToken } from '@/utils/jwt';
import twilioClient from "@/utils/twilio";
import { redisClient, setAsync } from "@/utils/redis";

const authService = {
    sendingOtp: async (user: UserAuthInput): Promise<void> => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();;
            await twilioClient.messages.create({
                body: `Your verification code is ${otp}`,
                to: user.phonenumber || ''
            });
            
            const key = `otp:${user.phonenumber}`;
            await redisClient.setEx(key, 300, otp);

        } catch (error) {
            throw new AppError('User registration failed', INTERNAL_SERVER_ERROR, 'USER_REGISTRATION_FAILED');
        }
    },
    pendingUser: async () => {

    },
    verifyOtp: async (phone: string, otp: string): Promise<boolean> => {
        const key = `otp:${phone}`;
        const storedOtp = await redisClient.get(key);
        if (storedOtp !== otp) {
            throw new AppError('Invalid OTP', BAD_REQUEST, 'INVALID_OTP');
        }
        await redisClient.del(key);
        return true;
    },
    createUser: async (user: UserAuthInput): Promise<{accessToken:string, refreshToken:string}> => {
        const {email} = user;
        const existingUser = await UserRepo.findUserbyEmail(email);
        if(existingUser){
            throw new AppError('User already exists', BAD_REQUEST, 'USER_ALREADY_EXISTS');
        }

        let newUser;
        const hashedPassword = await Bcrypt.hashed(user.password || '');
        newUser = await UserRepo.createUser({
            ...user,
            password: hashedPassword
        });
        if (!newUser) {
            throw new AppError('User creation failed', INTERNAL_SERVER_ERROR, 'USER_CREATION_FAILED');
        }

        const accessToken = createAccessToken({ id: newUser.id });
        const refreshToken = createRefreshToken({ id: newUser.id });
        return {accessToken, refreshToken};
    },
    
    registerUser: async (user: UserAuthInput): Promise<void> => {
        try{
            const existingUser = await UserRepo.findUserbyEmail(user.email);
            if(existingUser){
                throw new AppError('User already exists', BAD_REQUEST, 'USER_ALREADY_EXISTS');
            }
            await authService.sendingOtp(user);
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
        
        const isPasswordValid = await Bcrypt.compared(password, user.password || '');
        if (!isPasswordValid) {
            throw new AppError('Incorrect email or password', BAD_REQUEST, 'INCORRECT_CREDENTIALS');
        }
        
        const accessToken: string = createAccessToken({ id: user.id });
        const refreshToken: string = createRefreshToken({ id: user.id });
        return { accessToken, refreshToken };
    }
};

export default authService;

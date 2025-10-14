import { Router } from "express";
import { requestOtp, loginlocal, verifyOtp, resendOtp, lineLogin, googleLogin, lineCallback, googleCallback, logout, refreshToken } from "@/controller/authController";

export const authRouter = Router();

authRouter.post('/login', loginlocal);

authRouter.post('/request-otp', requestOtp);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/resend-otp', resendOtp);

authRouter.get('/refresh', refreshToken);

authRouter.get('/google', googleLogin);

authRouter.get('/google/callback', googleCallback);

authRouter.post('/line', lineCallback);

authRouter.get('/line/callback', lineCallback);

authRouter.post('/logout', logout);
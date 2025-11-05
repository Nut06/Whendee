import { Router } from "express";
import { requestOtp, loginlocal, verifyOtp, resendOtp, lineLogin, googleLogin, lineCallback, googleCallback, refreshToken, getUser } from "@/controller/authController";

export const authRouter: Router = Router();

authRouter.post('/login', loginlocal);

authRouter.post('/request-otp', requestOtp);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/resend-otp', resendOtp);

authRouter.post('/refresh', refreshToken);

authRouter.get('/google', googleLogin);

authRouter.get('/google/callback', googleCallback);

authRouter.post('/line', lineCallback);

authRouter.get('/line/callback', lineCallback);

authRouter.get('/me', getUser);
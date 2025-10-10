import { Router } from "express";
import { requestOtp, loginlocal, verifyOtp, resendOtp, lineLogin, googleLogin, lineCallback, googleCallback } from "@/controller/authController";

export const authRouter = Router();

authRouter.post('/login', loginlocal);

authRouter.post('/request-otp', requestOtp);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/resend-otp', resendOtp)

authRouter.post('/line-login', lineCallback);

authRouter.post('/google-login', googleCallback);

authRouter.post('logout',)
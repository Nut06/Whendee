import { Router } from "express";
import { register, loginlocal, verifyOtp, createUser } from "@/controller/authController";

export const authRouter = Router();

authRouter.post('/login', loginlocal);

authRouter.post('/register', register);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/createUser', createUser);
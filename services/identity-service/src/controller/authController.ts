import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from '@/types/http.js';
import { Token, UserAuthInput } from '@/types/user.js';
import type { Request, Response } from "express";
import Bcrypt from '@/utils/bcrypt';
import passport from 'passport';
import { AppError } from '@/types/appError';
import authService from '@/service/authService';

const isProd = process.env.NODE_ENV === 'production';

export const register = async (req: Request, res: Response) => {
  const {email, password, fullname, phonenumber}:UserAuthInput = req.body;
  
  if(!email || !password || !fullname || !phonenumber){
    return res.status(BAD_REQUEST).json({message:"All fields are required"});
  }
  try {
    await authService.registerUser({email, password, fullname, phonenumber});
  } catch (err) {
    throw new AppError('Registration failed', BAD_REQUEST, 'REGISTRATION_FAILED');
  }
  return res.status(OK).json({ success:true });

}

export const loginlocal = async (req: Request, res: Response) => passport.authenticate('local', { session: false }, (err:any, token:Token, info?:any) => {
  if (err) {
    return res.status(BAD_REQUEST).json({ message: err.message || 'Login failed' });
  }
  if (!token) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
  }
  res.cookie('accessToken', token.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000 // 15 minutes
  })
  .cookie('refreshToken', token.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  .status(OK);
  })(req, res);

export const createUser = async (req:Request, res:Response) => {
  const {fullname, email, phonenumber, password}:UserAuthInput = req.body;
  if(!email || !password || !fullname || !phonenumber){
    return res.status(BAD_REQUEST).json({message:"All fields are required"});
  }
  try {
    const tokens = await authService.createUser({fullname, email, phonenumber, password});
    return res.cookie('accessToken', tokens.accessToken, 
      {
        httpOnly: true,
        secure: isProd
      })
    .cookie('refreshToken', tokens.refreshToken,
      {
        httpOnly: true,
        secure: isProd
      })
    .status(OK)
    .json({success:true});
  }
  catch (error) {
    if (error instanceof AppError) {
      return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}
}

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.query;
  if (!phone || !otp) {
    return res.status(BAD_REQUEST).json({ message: 'User ID and OTP are required' });
  }
  try {
    const isVerified = await authService.verifyOtp(phone as string, otp as string);
    if (!isVerified) {
      return res.status(BAD_REQUEST).json({ success: false });
    }
    return res.status(OK).json({ success: true });
  } catch (error) {
    return res.status(BAD_REQUEST).json({ message: 'OTP verification failed' });
  }
}

export const resendOtp = async (req: Request, res: Response) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(BAD_REQUEST).json({ message: 'Phone number is required' });
  }
  try {
    const user = { phonenumber: phone as string, email: '' }; // Dummy email, adjust as needed
    await authService.sendingOtp(user);
    return res.status(OK).json({ success: true });
  } catch (error) {
    return res.status(BAD_REQUEST).json({ message: 'Resend OTP failed' });
  }
}

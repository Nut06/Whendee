import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from '@/types/http';
import { Otp, AuthToken, RequestOTP, OTPSession, ResponseLogin, User } from '@/types/user';
import type { Request, Response } from "express";
import Bcrypt from '@/utils/bcrypt';
import passport, { session } from 'passport';
import { AppError } from '@/types/appError';
import authService from '../service/authService';
import { ResponseOTP } from '../types/user';

const isProd = process.env.NODE_ENV === 'production';

export const requestOtp = async (req: Request, res: Response) => {
  const {email, password, fullname, phone}:RequestOTP = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  if(!email || !password || !fullname || !phone || !userAgent || !ip){
    return res.status(BAD_REQUEST).json({message:"All fields are required"});
  }

  try {
    const session: string = await authService.sendingOtp({phone, ip, userAgent});
    await authService.storePendingUser({email, password, fullname, phone: phone});
    const response: ResponseOTP = {
      success: true,
      message:"Already Sending OTP",
      data:{
        sessionToken:session,
        expiresIn:300
      }
    }
    return res.status(OK).json( response );
  } catch (err) {
    throw new AppError('Registration failed', BAD_REQUEST, 'REGISTRATION_FAILED');
  }

}

const genLoginResponse = (token:AuthToken, message='Login successful'):ResponseLogin => {
  const oneHour = 3600000;
  return {
    success: true,
    message: message,
    data: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: oneHour
    }
  };
}

export const loginlocal = async (req: Request, res: Response) => passport.authenticate('local', { session: false }, (err:any, token:AuthToken, info?:any) => {
    if (err) {
      return res.status(BAD_REQUEST).json({ message: err.message || 'Login failed' });
    }
    if (!token) {
      return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
    }

    const resdata:ResponseLogin = genLoginResponse(token);
    return res.json(resdata).status(OK);
  })(req, res);

export const verifyOtp = async (req: Request, res: Response):Promise<Response> => {
  const { sesssion: session, otp } = req.body;
  if (!session) {
    return res.status(BAD_REQUEST).json({ message: 'Session token is required' });
  }
  try {
      const isVerified = await authService.verifyOtp(session, otp);
      if (!isVerified) {
        return res.status(BAD_REQUEST).json({ success: false });
      }
      const user = await authService.getPendingUser(session);
      const {newUser, accessToken, refreshToken } = await authService.createUser(user);
      const resdata:ResponseLogin = genLoginResponse({ accessToken, refreshToken }, 'OTP verified and user registered successfully');
      return res.json(resdata);
  } catch (error) {
      return res.status(BAD_REQUEST).json({ message: 'OTP verification failed' });
  }
}

export const resendOtp = async (req: Request, res: Response) => {
  const { session, phone } = req.query;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  if (!phone || typeof phone !== 'string' || typeof session !== 'string' || !ip || !userAgent) {
    return res.status(BAD_REQUEST).json({ message: 'Phone number is required' });
  }

  try {
      const token = await authService.resendOtp({session, phone, ip, userAgent});
      const response: ResponseOTP = {
      success: true,
      message:"Already Sending OTP",
      data:{
        sessionToken:token,
        expiresIn:300
      }
    }
    return res.status(OK).json({ response });
  } catch (error) {
      return res.status(BAD_REQUEST).json({ message: 'Resend OTP failed' });
  }
}

export const lineLogin = async (req: Request, res: Response) => {
  return passport.authenticate('line', { session: false })(req, res);
}

export const lineCallback = async (req: Request, res: Response) => {
  return await passport.authenticate('line', { session: false }, (err:any, token:AuthToken, info?:any) => {
    if (err) {
      return res.status(BAD_REQUEST).json({ message: err.message || 'Line login failed' });
    }
    if (!token) {
      return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
    }
    return res.status(OK).json(genLoginResponse(token, 'Line login successful'));
  })(req, res);
}

export const googleLogin = async (req: Request, res: Response) => {
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res);
}

export const googleCallback = async (req: Request, res: Response) => {
  return passport.authenticate('google', { session: false }, (err:any, token:AuthToken, info?:any) => {
    if (err) {
      return res.status(BAD_REQUEST).json({ message: err.message || 'Google login failed' });
    }
    if (!token) {
      return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
    }
    return res.json(genLoginResponse(token, 'Google login successful'));
  })(req, res);
}

export const logout = async (req: Request, res: Response) => {
  try {
    // Since you're using stateless JWT authentication (session: false),
    // logout is handled client-side by removing tokens
    // Optionally, you could blacklist the token here if needed
    
    return res.status(OK).json({
      success: true, 
      message: 'Logout successful' 
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
}
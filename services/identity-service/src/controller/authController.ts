import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from '@/types/http';
import { AuthToken, OTPRequest, OTPResponse, LoginResponse, VerifyOTPResponse } from '@/types/user';
import type { NextFunction, Request, Response } from "express";
import passport from 'passport';
import '@/utils/passport';
import { AppError } from '@/types/appError';
import authService from '@/service/authService';
import { resolveUserId } from '@/utils/authRequest';
import UserRepo from '@/repo/userRepo';

export const requestOtp = async (req: Request, res: Response) => {
  const {email, password, fullname, phone}:OTPRequest = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  if(!email || !password || !fullname || !phone || !userAgent || !ip){
    return res.status(BAD_REQUEST).json({message:"All fields are required"});
  }

  try {
    const session: string = await authService.sendingOtp({phone, ip, userAgent});
    await authService.storePendingUser({email, password, fullname, phone: phone});
    const response: OTPResponse = {
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

const allowedRedirectSchemes = (process.env.GOOGLE_OAUTH_ALLOWED_SCHEMES || 'frontend,exp,http,https')
  .split(',')
  .map((scheme) => scheme.trim().replace(/:$/, ''))
  .filter(Boolean);

const fallbackRedirectTarget = (() => {
  const fallback = process.env.GOOGLE_OAUTH_FALLBACK ?? process.env.FRONT_END_URL ?? 'http://localhost:3000';
  try {
    // Throws if invalid URL; allow plain scheme prefixes like exp://...
    const parsed = new URL(fallback);
    const protocol = parsed.protocol.replace(':', '');
    if (!allowedRedirectSchemes.includes(protocol)) {
      allowedRedirectSchemes.push(protocol);
    }
    return parsed.toString();
  } catch {
    // As a last resort, default to localhost
    return 'http://localhost:3000';
  }
})();

const isAllowedRedirect = (target?: string): target is string => {
  if (!target) return false;
  try {
    const parsed = new URL(target);
    const protocol = parsed.protocol.replace(':', '');
    return allowedRedirectSchemes.includes(protocol);
  } catch (err) {
    return false;
  }
};

const parseRedirectTarget = (raw: unknown): string | null => {
  if (typeof raw !== 'string' || !raw.length) {
    return null;
  }
  const decoded = decodeURIComponent(raw);
  return isAllowedRedirect(decoded) ? decoded : null;
};

const encodeState = (redirectUri: string): string => {
  const payload = { redirectUri };
  const json = JSON.stringify(payload);
  return Buffer.from(json, 'utf8').toString('base64url');
};

const decodeState = (raw: unknown): string | null => {
  if (typeof raw !== 'string' || !raw.length) {
    return null;
  }
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { redirectUri?: string };
    if (typeof parsed.redirectUri === 'string' && isAllowedRedirect(parsed.redirectUri)) {
      return parsed.redirectUri;
    }
    return null;
  } catch {
    return null;
  }
};

const buildRedirectWithParams = (base: string, params: Record<string, string>): string => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};
const genLoginResponse = (token:AuthToken, message='Login successful'):LoginResponse => {
  return {
    success: true,
    message: message,
    data: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
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

    const resdata:LoginResponse = genLoginResponse(token);
    return res.json(resdata).status(OK);
  })(req, res);

export const verifyOtp = async (req: Request, res: Response):Promise<Response> => {
  const { session, otp } = req.body;
  if (!session) {
    return res.status(BAD_REQUEST).json({ message: 'Session token is required' });
  }
  try {
        const sessionData = await authService.verifyOtp(session, otp);
        if (!sessionData) {
          return res.status(BAD_REQUEST).json({ success: false });
        }
        const user = await authService.getPendingUser(sessionData.phone);
        const { user: newUser, tokens } = await authService.createUser(user);
        const resdata: VerifyOTPResponse = {
          success: true,
          message: "OTP verified successfully",
          data: {
            user: newUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        }
      };
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
      const response: OTPResponse = {
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

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(BAD_REQUEST).json({ message: 'Refresh token is required' });
  }
  try {
    const newTokens = await authService.refreshToken(refreshToken);
    return res.status(OK).json(genLoginResponse(newTokens, 'Token refreshed successfully'));
  } catch (error) {
    return res.status(BAD_REQUEST).json({ message: 'Refresh token failed' });
  }
}


// ===== LINE OAUTH (stateless similar to Google) =====
export const lineLogin = async (req: Request, res: Response, next: NextFunction) => {
  const rawRedirect = req.query.redirectUri;
  const redirectTarget = parseRedirectTarget(rawRedirect) ?? fallbackRedirectTarget;
  console.log('[LINE][Controller] lineLogin', {
    rawRedirect,
    redirectTarget,
    allowedSchemes: process.env.GOOGLE_OAUTH_ALLOWED_SCHEMES,
  });
  return passport.authenticate('line', {
    session: false,
    state: encodeState(redirectTarget),
  })(req, res, next);
};

export const lineCallback = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUri = decodeState(req.query.state) ?? fallbackRedirectTarget;
  console.log('[LINE][Controller] lineCallback start', {
    rawState: req.query.state,
    decodedRedirect: redirectUri,
  });

  const sendRedirect = (params: Record<string, string>) => {
    const location = buildRedirectWithParams(redirectUri, params);
    console.log('[LINE][Controller] Redirecting to client', {
      locationLength: location.length,
      params,
    });
    return res.redirect(location);
  };

  return passport.authenticate('line', { session: false }, (err: any, token: AuthToken, info?: any) => {
    if (err) {
      console.log('[LINE][Controller] lineCallback error', { message: err.message });
      return sendRedirect({ success: 'false', error: err.message || 'Line login failed' });
    }
    if (!token) {
      console.log('[LINE][Controller] lineCallback missing token');
      return sendRedirect({ success: 'false', error: 'Invalid credentials' });
    }
    console.log('[LINE][Controller] lineCallback success', {
      accessTokenPreview: token.accessToken?.slice(0, 12) + '...',
      hasRefresh: Boolean(token.refreshToken),
      accessExp: token.accessTokenExpiresAt?.toISOString?.() ?? null,
      refreshExp: token.refreshTokenExpiresAt?.toISOString?.() ?? null,
    });
    const params: Record<string, string> = {
      success: 'true',
      access: token.accessToken,
      refresh: token.refreshToken,
    };
    if (token.accessTokenExpiresAt) params.access_expires = token.accessTokenExpiresAt.toISOString();
    if (token.refreshTokenExpiresAt) params.refresh_expires = token.refreshTokenExpiresAt.toISOString();
    return sendRedirect(params);
  })(req, res, next);
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const redirectTarget = parseRedirectTarget(req.query.redirectUri) ?? fallbackRedirectTarget;

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'consent',
    state: encodeState(redirectTarget),
  })(req, res, next);
}

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUri = decodeState(req.query.state) ?? fallbackRedirectTarget;

  const sendRedirect = (params: Record<string, string>) => {
    const location = buildRedirectWithParams(redirectUri, params);
    return res.redirect(location);
  };

  return passport.authenticate('google', { session: false }, (err:any, token:AuthToken, info?:any) => {
    if (err) {
      return sendRedirect({
        success: 'false',
        error: err.message || 'Google login failed',
      });
    }
    if (!token) {
      return sendRedirect({
        success: 'false',
        error: 'Invalid credentials',
      });
    }

    const params: Record<string, string> = {
      success: 'true',
      access: token.accessToken,
      refresh: token.refreshToken,
    };

    if (token.accessTokenExpiresAt) {
      params.access_expires = token.accessTokenExpiresAt.toISOString();
    }
    if (token.refreshTokenExpiresAt) {
      params.refresh_expires = token.refreshTokenExpiresAt.toISOString();
    }

    return sendRedirect(params);
  })(req, res, next);
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    // In dev override (no token), resolveUserId returns id; fetch user directly
    const user = await UserRepo.findUserById(userId);
    if (!user) {
      return res.status(BAD_REQUEST).json({ message: 'Get user failed' });
    }
    return res.status(OK).json({ success: true, data: { user } });
  } catch (error) {
    return res.status(BAD_REQUEST).json({ message: 'Get user failed' });
  }
}

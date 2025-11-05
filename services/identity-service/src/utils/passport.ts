import prisma from '@/utils/prisma';
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as Google } from 'passport-google-oauth20';
import passport from 'passport'; 
import { Strategy as LineStrategy } from 'passport-line';
import bcrypt from 'bcrypt';
import UserRepo from '@/repo/userRepo';
import Bcrypt from '@/utils/bcrypt';
import id from 'zod/v4/locales/id.js';
import authService from '@/service/authService';
import { AuthToken } from '@/types/user';

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {

    try {
        const token:AuthToken = await authService.loginUser(email, password);
        return done(null, token);
    } catch (error) {
      return done(error);
    }
  }
));

// Build callback URLs robustly: prefer explicit env, otherwise derive from IDENTITY_URL
const identityBaseUrl = (process.env.IDENTITY_URL || '').replace(/\/$/, '');
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL && !process.env.GOOGLE_CALLBACK_URL.includes('${')
  ? process.env.GOOGLE_CALLBACK_URL
  : identityBaseUrl
    ? `${identityBaseUrl}/auth/google/callback`
    : '/auth/google/callback';

const googleStarategy = new Google(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: googleCallbackURL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    try {
      const token: AuthToken = await authService.loginWithGoogle(profile);
      return done(null, token);
    } catch (error) {
      return done(error);
    }
  }
);

const lineCallbackURL = process.env.LINE_CALLBACK_URL && !process.env.LINE_CALLBACK_URL.includes('${')
  ? process.env.LINE_CALLBACK_URL
  : identityBaseUrl
    ? `${identityBaseUrl}/auth/line/callback`
    : '/auth/line/callback';

const lineStrategy = new LineStrategy(
  {
    channelID: process.env.LINE_CHANNEL_ID as string,
    channelSecret: process.env.LINE_CHANNEL_SECRET as string,
    callbackURL: lineCallbackURL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    try {
      const token: AuthToken = await authService.loginWithLine(profile);
      return done(null, token);
    } catch (error) {
      return done(error);
    }
  }
);

passport.use('google', googleStarategy);
passport.use('line', lineStrategy);

export default passport;
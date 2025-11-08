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

const isGoogleAuthEnabled =
  process.env.ENABLE_GOOGLE_AUTH?.toLowerCase() !== 'false' &&
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

if (isGoogleAuthEnabled) {
  const googleStrategy = new Google(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: Function) => {
      try {
        const token: AuthToken = await authService.loginWithGoogle(profile);
        return done(null, token);
      } catch (error) {
        return done(error);
      }
    },
  );

  passport.use('google', googleStrategy);
} else {
  console.log('[Google][Passport] Strategy disabled - missing credentials or ENABLE_GOOGLE_AUTH=false');
}

const isLineAuthEnabled =
  process.env.ENABLE_LINE_AUTH?.toLowerCase() !== 'false' &&
  Boolean(process.env.LINE_CHANNEL_ID) &&
  Boolean(process.env.LINE_CHANNEL_SECRET);

if (isLineAuthEnabled) {
  const lineStrategy = new LineStrategy(
    {
      channelID: process.env.LINE_CHANNEL_ID as string,
      channelSecret: process.env.LINE_CHANNEL_SECRET as string,
      callbackURL: process.env.LINE_CALLBACK_URL || '/auth/line/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: Function) => {
      try {
        console.log('[LINE][Passport] Callback invoked', {
          provider: profile?.provider,
          profileId: profile?.id,
          displayName: profile?.displayName,
          hasEmails: Array.isArray(profile?.emails) && profile.emails.length > 0,
        });
        const token: AuthToken = await authService.loginWithLine(profile);
        console.log('[LINE][Passport] loginWithLine succeeded');
        return done(null, token);
      } catch (error: any) {
        console.log('[LINE][Passport] loginWithLine failed', {
          message: error?.message,
          code: error?.code,
        });
        return done(error);
      }
    },
  );

  passport.use('line', lineStrategy);

  console.log('[LINE][Passport] Strategy registered', {
    hasChannelId: Boolean(process.env.LINE_CHANNEL_ID),
    hasChannelSecret: Boolean(process.env.LINE_CHANNEL_SECRET),
    callbackURL: process.env.LINE_CALLBACK_URL || '/auth/line/callback',
  });
} else {
  console.log('[LINE][Passport] Strategy disabled - missing credentials or ENABLE_LINE_AUTH=false');
}

export default passport;

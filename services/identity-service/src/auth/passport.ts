import prisma from '@/utils/prisma';
import { Strategy as LocalStrategy } from 'passport-local'
import passport from 'passport';
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

export default passport;
import express from 'express';
import type { Response, Request, RequestHandler } from 'express';
import cors, { CorsOptions } from 'cors';
import { OK } from '@/types/http';
import { authRouter } from './router/authRoute';
import { userRouter } from './router/userRoute';
import { redisClient } from './utils/redis';
import passport from '@/utils/passport';

const app = express();
const PORT = process.env.PORT || 3002;

const isProduction = process.env.NODE_ENV === 'production';
const rawOrigins = process.env.CORS_ORIGIN ?? process.env.FRONT_END_URL ?? '';
const allowedOrigins = new Set(
  rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const relaxedPrefixes = ['exp://', 'frontend://'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (!isProduction && !allowedOrigins.size) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || relaxedPrefixes.some((prefix) => origin.startsWith(prefix))) {
      return callback(null, true);
    }

    if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+):\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(passport.initialize() as unknown as RequestHandler);

redisClient.connect();

app.listen(PORT, () => {
  console.log(`identity Service is running on port ${PORT}`);
});

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(OK).json({message:"index Identity Service is running"});
}
);

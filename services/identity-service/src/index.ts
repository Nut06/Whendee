import express from 'express';
import type { Response, Request } from 'express';
import { OK } from '@/types/http';
import { authRouter } from './router/authRoute';
import { redisClient } from './utils/redis';

const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

redisClient.connect();

app.listen(PORT, () => {
  console.log(`identity Service is running on port ${PORT}`);
});

app.use('/auth',authRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(OK).json({message:"index Identity Service is running"});
}
);
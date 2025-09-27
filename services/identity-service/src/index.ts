import express from 'express';
import type { Response, Request } from 'express';

const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());

app.listen(PORT, () => {
  console.log(`identity Service is running on port ${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({message:"index Identity Service is running"});
}
);
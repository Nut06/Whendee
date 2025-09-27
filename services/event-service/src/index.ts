import express from 'express';
import type { Response,  Express, Request } from 'express';

const app:Express = express();

app.use(express.json());
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Event Service is running on port ${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({message:"Event Service is running"});
});
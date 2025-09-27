import express from 'express';
import type { Response, Request } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Communication Service is running on port ${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({message:"Communication Service is running"});
}
);
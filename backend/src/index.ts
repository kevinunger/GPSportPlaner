import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongo from './db/index';

import bookingsRouter from './routes/bookings/index';
import infoRouter from './routes/info/index';

const env = process.env.NODE_ENV || 'development';

// load env variables from .env.development or .env.production
dotenv.config({
  path: `.env.${env}`,
});

const app = express();
const port = process.env.PORT;
console.log(port);

// setup express middleware
app.use(cors());
app.use(express.json());

// setup routes
app.use('/bookings', bookingsRouter);
app.use('/info', infoRouter);

app.get('/', (req: any, res: any) => {
  res.send('Express + TypeScript Server');
});

connectMongo().catch(err => console.log(err));

app.listen(port, () => {
  console.log(`using env: ${env}`);
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
export { app };

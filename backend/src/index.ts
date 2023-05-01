import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongo from './db/index';

import bookingsRouter from './routes/bookings/index';
import infoRouter from './routes/info/index';
import adminsRouter from './routes/admins/index';
import authRouter from './routes/auth/index';
import { config } from 'dotenv';

config();
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// load env variables from .env.development or .env.production
dotenv.config({
  path: path.join(__dirname, `.env.${env}`),
});

const app = express();
const port = process.env.PORT;

// setup express middleware
app.use(
  cors({
    origin: '*', // allow requests from any other server // TODO: CORS_OPTIONS
    credentials: true,
  })
);
app.use(express.json());

// setup routes
app.use('/bookings', bookingsRouter);
app.use('/info', infoRouter);
app.use('/admins', adminsRouter);
app.use('/auth', authRouter);

app.get('/', (req: any, res: any) => {
  res.send('Express + TypeScript Server');
});

if (process.env.NODE_ENV !== 'test') {
  connectMongo().catch(err => console.log(err));

  app.listen(port, () => {
    console.log(`using env: ${env}`);
    console.log(`[server]: Server is running at http://localhost:${port}`);
    console.log(process.env.JWT_SECRET);
  });
}

export { app };

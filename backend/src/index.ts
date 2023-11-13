import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongo from './db/index';

import bookingsRouter from './routes/bookings/index';
import infoRouter from './routes/info/index';
import adminsRouter from './routes/admins/index';
import authRouter from './routes/auth/index';
import { config } from 'dotenv';
import { validateEnvVariables } from './utils/validateEnv';

// check if all env keys are there and valid
validateEnvVariables();

config();
const path = require('path');

const env = process.env.NODE_ENV;
if (env !== 'test' && env !== 'development' && env !== 'production') {
  throw new Error('NODE_ENV must be either test, development or production');
}

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

if (process.env.NODE_ENV !== 'test') {
  connectMongo().catch(err => console.log(err));

  app.listen(+port, '0.0.0.0', () => {
    console.log(`using env: ${env}`);
    console.log(`[server]: Server is running at http://localhost:${port}`);
    // console.log(process.env.JWT_SECRET);
  });
}

export { app };

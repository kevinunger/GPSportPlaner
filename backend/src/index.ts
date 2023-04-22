import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongo from './db/index';

import bookingsRouter from './routes/bookings/index';
import infoRouter from './routes/info/index';
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// path is ../ when running /dist/index.js
const relativePath = env === 'development' ? '.' : '../';

// load env variables from .env.development or .env.production
dotenv.config({
  path: path.join(__dirname, `.env.${env}`),
});
console.log('-------');
console.log(`${relativePath}env.${env}`);
console.log('-------');

const app = express();
const port = process.env.PORT;
console.log(port);

// setup express middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// setup routes
app.use('/bookings', bookingsRouter);
app.use('/info', infoRouter);

app.get('/', (req: any, res: any) => {
  res.send('Express + TypeScript Server');
});

if (process.env.NODE_ENV !== 'test') {
  connectMongo().catch(err => console.log(err));

  app.listen(port, () => {
    console.log(`using env: ${env}`);
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export { app };

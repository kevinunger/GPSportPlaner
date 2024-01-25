import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Admin, IAdmin } from '../models/Admin';

const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: `.env.${env}`,
});

let MONGO_CONNECTION_STRING: string;
if (process.env.NODE_ENV === 'development') {
  MONGO_CONNECTION_STRING =
    'mongodb://' +
    process.env.MONGO_USER +
    ':' +
    process.env.MONGO_PASSWORD +
    '@' +
    process.env.MONGO_HOST +
    '/';
} else {
  MONGO_CONNECTION_STRING =
    'mongodb+srv://' +
    process.env.MONGO_USER +
    ':' +
    process.env.MONGO_PASSWORD +
    '@' +
    process.env.MONGO_HOST +
    '/' +
    process.env.MONGO_DB +
    '?retryWrites=true&w=majority';
}

// const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017/gps';

// connect to mongodb
export default async function connectMongo() {
  console.log(`${MONGO_CONNECTION_STRING}`);
  await mongoose
    .connect(MONGO_CONNECTION_STRING)
    .then(() => {
      const db_name = mongoose.connection.name;
      console.log(
        `connected to mongo db: ${db_name} with connection string: ${MONGO_CONNECTION_STRING}`
      );
    })
    .catch((err: any) => {
      console.error(err);
      throw new Error(err);
    });
}

const mongod = new MongoMemoryServer();

// connect to test db
export async function connectMongoTest() {
  await mongod.start();
  const uri = await mongod.getUri();
  const mongoOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions;
  await mongoose.connect(uri, mongoOpts);
}

// disconnect and close test db
export async function closeMongoTest() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

// clear db, remove all data
export async function clearMongoTest(excludeCollections = []) {
  // CRASH IF CONNECT TO REAL DB OR TEST DB OR ENV is not test
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Attempt to clear non-test database');
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (!excludeCollections.includes(key)) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}

async function populateLocalDB() {
  // post request to
  // localhost:3000/api/auth/setInitialPw
  // with body:
}

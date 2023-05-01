import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: `.env.${env}`,
});

const MONGO_CONNECTION_STRING =
  'mongodb+srv://' +
  process.env.MONGO_USER +
  ':' +
  process.env.MONGO_PASSWORD +
  '@' +
  process.env.MONGO_HOST +
  '/' +
  process.env.MONGO_DB +
  '?retryWrites=true&w=majority';

// connect to mongodb
export default async function connectMongo() {
  await mongoose
    .connect(MONGO_CONNECTION_STRING)
    .then(() => {
      console.log('connected to mongo');
    })
    .catch((err: any) => {
      console.error(err);
    });
}

const mongod = new MongoMemoryServer();

// connect to test db
export async function connectMongoTest() {
  await mongod.start(); // Add this line to start the MongoMemoryServer
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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (!excludeCollections.includes(key)) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}

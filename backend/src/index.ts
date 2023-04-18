import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import bookingsRouter from "./routes/bookings/index";

const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});

const app = express();
const port = process.env.PORT;
const MONGO_CONNECTION_STRING =
  "mongodb+srv://" +
  process.env.MONGO_USER +
  ":" +
  process.env.MONGO_PASSWORD +
  "@" +
  process.env.MONGO_HOST +
  "/" +
  process.env.MONGO_DB +
  "?retryWrites=true&w=majority";
console.log(MONGO_CONNECTION_STRING);

// connect to mongodb
main().catch((err) => console.log(err));
async function main() {
  await mongoose
    .connect(MONGO_CONNECTION_STRING)
    .then(() => {
      console.log("connected to mongo");
    })
    .catch((err: any) => {
      console.log(err);
    });
}

app.use(cors());
app.use(express.json());

app.use("/bookings", bookingsRouter);

app.get("/", (req: any, res: any) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`using env: ${env}`);
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

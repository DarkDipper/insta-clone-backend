import mongoose from "mongoose";
import dotenv from "dotenv";
import Logging from "../library/Logging";

dotenv.config();

const DB_URI = process.env.DB_URI;
// connect to user collection in database


export default async function connectDB() {
  try {
    if (DB_URI === "") {
      throw new Error("Database URI not found");
    }
    await mongoose.connect(DB_URI, {
      maxPoolSize: 50,
      writeConcern: {
        wtimeout: 2500,
      },
    });
    Logging.log("Database connected");
  } catch (error) {
    Logging.error(error);
    process.exit(1);
  }
}

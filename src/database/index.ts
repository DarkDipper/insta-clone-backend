import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URI = process.env.DB_URI || "";

export default async function connectDB(){
    try {
        await mongoose.connect(DB_URI, {
          maxPoolSize: 50,
          writeConcern: {
            wtimeout: 2500
          }
        });
        console.log("[database]: Database connected");
    } catch (error) {
        console.log("[database]: Database connection error");
      console.log(error);
      process.exit(1);
    }
}
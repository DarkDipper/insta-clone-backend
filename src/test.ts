import { generateToken } from "./utils/generateToken";
import jwt  from "jsonwebtoken";
import dotenv from "dotenv"
import Mongoose from "mongoose";
dotenv.config();

// const user = {
//   userName: "Trung",
//   role: "admin",
//   _id: new Mongoose.Types.ObjectId("123456")
// }

// const SECRET_KEY_TOKEN = process.env.SECRET_KEY_TOKEN || "";

// const userToken = generateToken(user,SECRET_KEY_TOKEN);

// const decode = jwt.verify(userToken, SECRET_KEY_TOKEN);

// console.log(userToken)

// console.log(decode)